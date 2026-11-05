// =========================================================
// WEB SANDBOX – edytor HTML/CSS/JS z podglądem na żywo i testami DOM
// =========================================================

import { h, setChildren } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { createEditor } from './code-editor.js';
import { buildDocument, runDomChecks } from '../engines/dom-checker.js';

/**
 * @param {object} opts { initial: {html, css, js}, checks, onChange(parts), onChecked(results) }
 */
export function createWebSandbox({ initial = {}, checks = [], onChange, onChecked } = {}) {
  const parts = { html: initial.html || '', css: initial.css || '', js: initial.js || '' };
  const editors = {};
  let active = 'html';
  let previewTimer;

  const consoleBody = h('pre.console__body', h('span.faint', '(brak wyjścia)'));
  const consoleLines = [];
  const iframe = h('iframe.sandbox__frame', { title: 'Podgląd strony', sandbox: 'allow-scripts' });
  const checksHost = h('div.sandbox__checks');
  const token = 'preview-' + Math.random().toString(36).slice(2);

  const onMsg = (e) => {
    if (e.source !== iframe.contentWindow || !e.data || e.data.token !== token || e.data.type !== 'inf04-log') return;
    consoleLines.push((e.data.kind === 'error' ? '✖ ' : e.data.kind === 'warn' ? '⚠ ' : '') + e.data.text);
    consoleBody.textContent = consoleLines.slice(-100).join('\n');
  };
  window.addEventListener('message', onMsg);

  for (const [key, lang, label] of [['html', 'xml', 'HTML'], ['css', 'css', 'CSS'], ['js', 'javascript', 'JavaScript']]) {
    editors[key] = createEditor({
      value: parts[key],
      lang,
      label: `Edytor ${label}`,
      minLines: 16,
      maxHeight: '460px',
      onRun: () => refresh(),
      onChange: (v) => {
        parts[key] = v;
        onChange?.({ ...parts });
        clearTimeout(previewTimer);
        previewTimer = setTimeout(refresh, 700);
      },
    });
  }

  const editorHost = h('div.sandbox__editor', editors.html.el);
  const tabs = h('div.tabs', { role: 'tablist', 'aria-label': 'Pliki' },
    [['html', 'index.html'], ['css', 'style.css'], ['js', 'script.js']].map(([key, label]) =>
      h('button', {
        type: 'button',
        role: 'tab',
        'aria-selected': String(key === active),
        onclick: (e) => {
          active = key;
          tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b === e.currentTarget)));
          setChildren(editorHost, editors[key].el);
          editors[key].focus();
        },
      }, label)
    )
  );

  function refresh() {
    consoleLines.length = 0;
    setChildren(consoleBody, h('span.faint', '(brak wyjścia)'));
    iframe.srcdoc = buildDocument(parts, { token });
  }

  async function check() {
    if (!checks.length) return [];
    checkBtn.disabled = true;
    setChildren(checksHost, h('div.loading', h('span.spinner'), ' Testowanie strony…'));
    const { results } = await runDomChecks(parts, checks);
    checkBtn.disabled = false;
    const passed = results.filter((r) => r.pass).length;
    setChildren(checksHost, 
      h(`div.lab-verdict.${passed === results.length ? 'is-pass' : 'is-fail'}`,
        icon(passed === results.length ? 'check' : 'x'),
        h('strong', `Testy automatyczne: ${passed}/${results.length}`)),
      h('ul.tests', results.map((r) =>
        h(`li.test.${r.pass ? 'is-pass' : 'is-fail'}`,
          h('span.test__icon', icon(r.pass ? 'check' : 'x')),
          h('div.test__body', h('span.test__name', r.name), r.error ? h('div.test__diff', r.error) : null)
        )
      ))
    );
    onChecked?.(results);
    return results;
  }

  const checkBtn = h('button.btn.btn--primary', { type: 'button', onclick: check }, icon('check'), 'Sprawdź automatycznie');

  const el = h('div.sandbox',
    h('div.sandbox__grid',
      h('div.sandbox__col', tabs, editorHost),
      h('div.sandbox__col',
        h('div.sandbox__preview-head', h('span.small.muted', 'Podgląd'), h('button.btn.btn--ghost.btn--sm', { type: 'button', onclick: refresh }, icon('refresh'), 'Odśwież')),
        iframe,
        h('div.console', h('div.console__title', 'Konsola strony'), consoleBody)
      )
    ),
    checks.length ? h('div.lab-actions', checkBtn, h('span.small.faint', `${checks.length} testów sprawdza strukturę i działanie strony`)) : null,
    checksHost
  );

  refresh();

  return {
    el,
    check,
    getParts: () => ({ ...parts }),
    destroy() {
      clearTimeout(previewTimer);
      window.removeEventListener('message', onMsg);
    },
  };
}
