// =========================================================
// GUI WORKSPACE – wieloplikowe środowisko pracy dla zadań GUI
//  • zakładki plików (XAML, XML, FXML, C#, Java, Kotlin, TS, JSX…)
//  • testy statyczne layoutu i kodu (gui-checker)
//  • React / React+TS: podgląd na żywo + testy działania (DOM)
// =========================================================

import { h, setChildren } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { createEditor } from './code-editor.js';
import { runStaticChecks } from '../engines/gui-checker.js';
import { buildReactDocument, prepareReactSource, runDomChecks } from '../engines/dom-checker.js';
import { tsTranspile, formatDiagnostic } from '../engines/ts-service.js';

const EXT_LANG = {
  xaml: 'xml', xml: 'xml', fxml: 'xml', html: 'xml',
  cs: 'csharp', java: 'java', kt: 'kotlin',
  ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript', css: 'css',
};

export const extOf = (name) => name.split('.').pop().toLowerCase();
export const langOfFile = (name) => EXT_LANG[extOf(name)] || 'javascript';

export function fileModes(files) {
  const modes = {};
  for (const f of files) {
    const e = extOf(f.name);
    modes[f.name] = e === 'html' ? 'html' : ['xaml', 'xml', 'fxml'].includes(e) ? 'xml' : 'code';
  }
  return modes;
}

/**
 * @param {object} opts
 *  files: [{ name, starter }]
 *  saved: { [name]: content }
 *  checks: testy statyczne
 *  domChecks: testy działania (tylko runnable)
 *  runnable: 'react' | null
 */
export function createGuiWorkspace({ files, saved = {}, checks = [], domChecks = [], runnable = null, onChange, onChecked, minLines = 18 }) {
  const contents = {};
  const editors = {};
  let active = files[0].name;
  let previewTimer;
  const token = 'gui-' + Math.random().toString(36).slice(2);
  const modes = fileModes(files);

  for (const f of files) {
    contents[f.name] = saved[f.name] ?? f.starter ?? '';
    editors[f.name] = createEditor({
      value: contents[f.name],
      lang: langOfFile(f.name),
      label: `Plik ${f.name}`,
      minLines,
      maxHeight: '540px',
      onRun: () => check(),
      onChange: (v) => {
        contents[f.name] = v;
        onChange?.({ ...contents });
        if (runnable) {
          clearTimeout(previewTimer);
          previewTimer = setTimeout(refreshPreview, 800);
        }
      },
    });
  }

  const editorHost = h('div.gui-ws__editor', editors[active].el);
  const tabs = h('div.tabs.gui-ws__tabs', { role: 'tablist', 'aria-label': 'Pliki projektu' },
    files.map((f) => h('button', {
      type: 'button',
      role: 'tab',
      'aria-selected': String(f.name === active),
      onclick: (e) => {
        active = f.name;
        tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b === e.currentTarget)));
        setChildren(editorHost, editors[f.name].el);
      },
    }, icon(['xaml', 'xml', 'fxml', 'html'].includes(extOf(f.name)) ? 'layers' : 'code'), f.name))
  );

  // ---------- React: podgląd ----------
  let iframe = null;
  const consoleBody = h('pre.console__body', h('span.faint', '(brak wyjścia)'));
  const consoleLines = [];
  const onMsg = (e) => {
    if (!iframe || e.source !== iframe.contentWindow || !e.data || e.data.token !== token || e.data.type !== 'inf04-log') return;
    consoleLines.push((e.data.kind === 'error' ? '✖ ' : '') + e.data.text);
    consoleBody.textContent = consoleLines.slice(-80).join('\n');
  };

  const mainFile = files.find((f) => /\.(jsx|tsx)$/.test(f.name))?.name;
  const cssFile = files.find((f) => f.name.endsWith('.css'))?.name;

  async function compileReact() {
    const src = prepareReactSource(contents[mainFile] || '');
    const out = await tsTranspile(src, mainFile.endsWith('.tsx') ? 'App.tsx' : 'App.tsx');
    return out;
  }

  async function refreshPreview() {
    if (!runnable || !iframe) return;
    consoleLines.length = 0;
    setChildren(consoleBody, h('span.faint', 'Kompilowanie…'));
    try {
      const { code, diagnostics } = await compileReact();
      if (diagnostics.length) {
        consoleBody.textContent = diagnostics.map((d) => '✖ ' + formatDiagnostic(d)).join('\n');
        return;
      }
      setChildren(consoleBody, h('span.faint', '(brak wyjścia)'));
      iframe.srcdoc = buildReactDocument(code, cssFile ? contents[cssFile] : '', { token });
    } catch (err) {
      consoleBody.textContent = '✖ ' + err.message;
    }
  }

  // ---------- Sprawdzanie ----------
  const resultsHost = h('div.gui-ws__results');
  const checkBtn = h('button.btn.btn--primary', { type: 'button', onclick: () => check() }, icon('check'), 'Sprawdź projekt');

  async function check() {
    checkBtn.disabled = true;
    setChildren(resultsHost, h('div.loading', h('span.spinner'), ' Sprawdzanie…'));
    const results = runStaticChecks(checks, contents, modes);
    if (runnable && domChecks.length) {
      try {
        const { code, diagnostics } = await compileReact();
        if (diagnostics.length) {
          results.push({ name: 'Kod komponentu kompiluje się', pass: false, error: diagnostics.map(formatDiagnostic).join('; '), points: 1 });
        } else {
          const dom = await runDomChecks(null, domChecks, 8000, ({ token: t, checks: c }) => buildReactDocument(code, cssFile ? contents[cssFile] : '', { token: t, checks: c }));
          dom.results.forEach((r, i) => results.push({ ...r, points: domChecks[i].points ?? 1, dom: true }));
        }
      } catch (err) {
        results.push({ name: 'Uruchomienie aplikacji React', pass: false, error: err.message, points: 1 });
      }
    }
    checkBtn.disabled = false;
    const passed = results.filter((r) => r.pass).length;
    const all = passed === results.length;
    setChildren(resultsHost,
      h(`div.lab-verdict.${all ? 'is-pass' : 'is-fail'}`, icon(all ? 'check' : 'x'),
        h('strong', all ? `Wszystkie testy zaliczone (${passed}/${results.length})!` : `Zaliczone testy: ${passed}/${results.length}`)),
      h('ul.tests', results.map((r) =>
        h(`li.test.${r.pass ? 'is-pass' : 'is-fail'}`,
          h('span.test__icon', icon(r.pass ? 'check' : 'x')),
          h('div.test__body',
            h('span.test__name', r.dom ? h('span.badge.badge--info', 'działanie') : h('span.badge', 'kod'), ' ', r.name),
            r.error ? h('div.test__diff', r.error) : null)
        )
      ))
    );
    onChecked?.(results);
    return results;
  }

  const workspace = h('div.gui-ws__main', tabs, editorHost);
  let previewCol = null;
  if (runnable) {
    iframe = h('iframe.sandbox__frame', { title: 'Podgląd aplikacji React', sandbox: 'allow-scripts' });
    window.addEventListener('message', onMsg);
    previewCol = h('div.gui-ws__preview',
      h('div.sandbox__preview-head', h('span.small.muted', 'Podgląd (React)'), h('button.btn.btn--ghost.btn--sm', { type: 'button', onclick: refreshPreview }, icon('refresh'), 'Odśwież')),
      iframe,
      h('div.console', h('div.console__title', 'Konsola / kompilator'), consoleBody)
    );
  }

  const el = h('div.gui-ws',
    h(`div.gui-ws__grid${runnable ? '.gui-ws__grid--preview' : ''}`, workspace, previewCol),
    h('div.lab-actions', checkBtn, h('span.small.faint', h('kbd', 'Ctrl'), '+', h('kbd', 'Enter'), ' – sprawdź')),
    resultsHost
  );

  if (runnable) setTimeout(refreshPreview, 50);

  return {
    el,
    check,
    getFiles: () => ({ ...contents }),
    setFiles(map) {
      for (const [name, v] of Object.entries(map)) if (editors[name]) editors[name].setValue(v);
    },
    destroy() {
      clearTimeout(previewTimer);
      window.removeEventListener('message', onMsg);
    },
  };
}
