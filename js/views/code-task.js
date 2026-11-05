// Zadanie programistyczne: edytor + testy jednostkowe w Web Workerze
import { h, setChildren, append } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { getCodeTasks } from '../core/loader.js';
import { renderMarkdown, highlightCode } from '../utils/markdown.js';
import { createEditor } from '../components/code-editor.js';
import { difficulty } from '../components/progress.js';
import { confirmDialog } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { runCode } from '../engines/code-runner.js';
import { LANG_LABELS } from '../config.js';

export default async function codeTask(root, { id }) {
  const tasks = await getCodeTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) {
    append(root, h('div.empty', h('h2', 'Nie ma takiego zadania'), h('a.btn', { href: '#/kod' }, 'Lista zadań')));
    return;
  }
  const task = tasks[idx];
  const next = tasks[idx + 1];
  document.title = `${task.title} · Code Lab`;

  const saved = store.get().code[id] || {};
  let saveTimer;
  const output = h('div.lab-output', { 'aria-live': 'polite' },
    h('p.muted.small', '„Uruchom” wykonuje kod i jawne testy. „Sprawdź” uruchamia również testy ukryte i zalicza zadanie.'));
  const statusBadge = h('span');
  const hintsHost = h('div.hints');
  const solutionsHost = h('div');
  let hintsShown = 0;

  const editor = createEditor({
    value: saved.lastCode ?? task.starter,
    lang: 'javascript',
    label: 'Edytor JavaScript',
    minLines: 14,
    onRun: () => execute(true),
    onChange: (v) => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => store.update((s) => { (s.code[id] ||= {}).lastCode = v; }, { silent: true }), 400);
    },
  });

  function paintStatus() {
    const st = store.get().code[id];
    setChildren(statusBadge, 
      st?.solved
        ? h('span.badge.badge--success', icon('check'), 'Rozwiązane')
        : st?.attempts ? h('span.badge.badge--warning', `Próby: ${st.attempts}`) : h('span.badge', 'Nowe')
    );
  }
  paintStatus();

  const runBtn = h('button.btn', { type: 'button', onclick: () => execute(false) }, icon('play'), 'Uruchom');
  const checkBtn = h('button.btn.btn--primary', { type: 'button', onclick: () => execute(true) }, icon('check'), 'Sprawdź');
  const hintBtn = h('button.btn.btn--ghost', {
    type: 'button',
    onclick: () => {
      if (hintsShown >= task.hints.length) return;
      hintsHost.append(h('aside.callout.callout--info', h('div.callout__title', icon('bulb'), h('span', `Podpowiedź ${hintsShown + 1}`)), h('p', task.hints[hintsShown])));
      hintsShown++;
      if (hintsShown >= task.hints.length) hintBtn.disabled = true;
    },
  }, icon('bulb'), 'Podpowiedź');
  const solutionBtn = h('button.btn.btn--ghost', {
    type: 'button',
    onclick: async () => {
      if (!store.get().code[id]?.solved) {
        const ok = await confirmDialog({ title: 'Pokazać rozwiązanie?', message: 'Najwięcej nauczysz się, walcząc z zadaniem samodzielnie. Na pewno?', confirmText: 'Pokaż' });
        if (!ok) return;
        store.update((s) => { (s.code[id] ||= {}).usedSolution = true; }, { silent: true });
      }
      showSolutions();
    },
  }, icon('eye'), 'Rozwiązanie');
  const resetBtn = h('button.btn.btn--ghost', {
    type: 'button',
    onclick: async () => {
      if (await confirmDialog({ title: 'Przywrócić kod startowy?', message: 'Twój kod zostanie zastąpiony szablonem.', confirmText: 'Przywróć' })) {
        editor.setValue(task.starter);
      }
    },
  }, icon('refresh'), 'Reset');

  async function execute(full) {
    const code = editor.getValue();
    runBtn.disabled = checkBtn.disabled = true;
    setChildren(output, h('div.loading', h('span.spinner'), ' Uruchamianie…'));
    const tests = full
      ? [...task.tests, ...(task.hiddenTests || []).map((t) => ({ ...t, hidden: true }))]
      : task.tests;
    const res = await runCode({ code, fn: task.fn, tests });
    runBtn.disabled = checkBtn.disabled = false;

    const passed = res.results.filter((r) => r.pass).length;
    const allPass = res.results.length > 0 && passed === res.results.length && !res.timeout;

    if (full) {
      const wasSolved = !!store.get().code[id]?.solved;
      store.update((s) => {
        const rec = (s.code[id] ||= {});
        rec.attempts = (rec.attempts || 0) + 1;
        rec.lastCode = code;
        if (allPass && !rec.solved) { rec.solved = true; rec.solvedAt = new Date().toISOString(); }
      }, { scope: 'code' });
      paintStatus();
      if (allPass && !wasSolved) {
        toast('Wszystkie testy zaliczone!', 'success');
        showSolutions();
      }
    }

    setChildren(output, 
      h(`div.lab-verdict.${allPass ? 'is-pass' : 'is-fail'}`,
        icon(allPass ? 'check' : 'x'),
        h('strong', allPass
          ? (full ? 'Zadanie zaliczone – wszystkie testy (także ukryte) przechodzą!' : 'Jawne testy przechodzą. Kliknij „Sprawdź”, aby uruchomić testy ukryte.')
          : `Zaliczone testy: ${passed}/${res.results.length}`)
      ),
      allPass && full && next ? h('a.btn.btn--success.btn--sm', { href: `#/kod/${next.id}`, style: 'margin-bottom:1rem' }, 'Następne zadanie', icon('arrowRight')) : null,
      res.topError ? h('div.test.is-fail', h('strong', 'Błąd podczas uruchamiania: '), res.topError) : null,
      h('ul.tests', res.results.map((r) =>
        h(`li.test.${r.pass ? 'is-pass' : 'is-fail'}`,
          h('span.test__icon', icon(r.pass ? 'check' : 'x')),
          h('div.test__body',
            h('code.test__name', r.hidden ? `Test ukryty${r.pass ? '' : ' (podpowiedź: ' + r.name + ')'}` : r.name),
            !r.pass
              ? h('div.test__diff',
                  r.error ? h('div', h('span.faint', 'Błąd: '), r.error) : null,
                  h('div', h('span.faint', 'Oczekiwano: '), h('code', r.expected ?? '—')),
                  r.got != null ? h('div', h('span.faint', 'Otrzymano: '), h('code', r.got)) : null)
              : null
          )
        )
      )),
      h('div.console',
        h('div.console__title', 'Konsola (console.log)'),
        h('pre.console__body', res.logs.length ? res.logs.join('\n') : h('span.faint', '(brak wyjścia)'))
      )
    );
  }

  async function showSolutions() {
    if (solutionsHost.childElementCount) return;
    const langs = Object.keys(task.solutions || {});
    if (!langs.length) return;
    const pref = store.get().settings.codeLang;
    let active = langs.includes(pref) ? pref : langs[0];
    const codeEl = h('code.hljs');
    const pre = h('pre', codeEl);
    async function paint() {
      codeEl.innerHTML = await highlightCode(task.solutions[active], active === 'js' ? 'javascript' : active);
      pre.dataset.lang = LANG_LABELS[active] || active;
    }
    const tabs = h('div.tabs', { role: 'tablist' }, langs.map((l) =>
      h('button', {
        type: 'button',
        role: 'tab',
        'aria-selected': String(l === active),
        onclick: (e) => {
          active = l;
          tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b === e.currentTarget)));
          paint();
        },
      }, LANG_LABELS[l] || l)));
    await paint();
    solutionsHost.append(h('section.card.solutions',
      h('h2', 'Wzorcowe rozwiązania'),
      h('p.small.muted', 'Porównaj ze swoim kodem. Wersje C++/C#/Python pokazują, jak ten sam algorytm wygląda w języku egzaminacyjnym.'),
      tabs, pre,
      task.explanation ? h('p.small', task.explanation) : null
    ));
    solutionBtn.disabled = true;
  }

  const prompt = await renderMarkdown(task.prompt);
  const examples = task.tests.filter((t) => t.args).slice(0, 3);

  append(root, 
    h('nav.breadcrumbs', h('a', { href: '#/kod' }, 'Code Lab'), h('span', { 'aria-hidden': 'true' }, '/'), h('span', task.title)),
    h('div.lab',
      h('section.lab-task',
        h('div.lab-task__head', h('h1', task.title), statusBadge),
        h('div.lab-task__meta', difficulty(task.difficulty), ...(task.concepts || []).map((c) => h('span.badge', c))),
        prompt.el,
        examples.length
          ? h('div.examples', h('h3.lab-sub', 'Przykłady'),
              h('ul', examples.map((t) => h('li', h('code', `${task.fn}(${t.args.map((a) => JSON.stringify(a)).join(', ')})`), ' → ', h('code', JSON.stringify(t.expected))))))
          : null,
        hintsHost
      ),
      h('section.lab-work',
        editor.el,
        h('div.lab-actions', checkBtn, runBtn, h('span.lab-actions__spacer'), task.hints?.length ? hintBtn : null, solutionBtn, resetBtn),
        h('p.small.faint', { style: 'margin:.25rem 0 0' }, h('kbd', 'Ctrl'), '+', h('kbd', 'Enter'), ' – sprawdź · ', h('kbd', 'Tab'), ' – wcięcie'),
        output,
        solutionsHost
      )
    )
  );

  if (store.get().code[id]?.solved) showSolutions();

  return () => clearTimeout(saveTimer);
}
