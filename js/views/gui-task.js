// Pracownia GUI – pojedyncze ćwiczenie (albo ściąga)
import { h, append, setChildren } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { getGui, fetchText } from '../core/loader.js';
import { renderMarkdown, highlightCode } from '../utils/markdown.js';
import { createGuiWorkspace, langOfFile } from '../components/gui-workspace.js';
import { difficulty } from '../components/progress.js';
import { confirmDialog } from '../components/modal.js';
import { toast } from '../components/toast.js';

export default async function guiTask(root, { id }) {
  if (id === 'sciaga') return cheatSheet(root);

  const { technologies, tasks } = await getGui();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) {
    append(root, h('div.empty', h('h2', 'Nie ma takiego ćwiczenia'), h('a.btn', { href: '#/gui' }, 'Pracownia GUI')));
    return;
  }
  const task = tasks[idx];
  const tech = technologies.find((t) => t.id === task.tech) || { label: task.tech };
  const next = tasks[idx + 1];
  document.title = `${task.title} (${tech.label}) · Pracownia GUI`;

  const rec = () => (store.get().gui[id] ||= {});
  const statusBadge = h('span');
  const hintsHost = h('div.hints');
  const solutionHost = h('div');
  let hintsShown = 0;
  let saveTimer;

  function paintStatus() {
    const st = store.get().gui[id];
    setChildren(statusBadge,
      st?.solved ? h('span.badge.badge--success', icon('check'), 'Zaliczone')
        : st?.attempts ? h('span.badge.badge--warning', `Próby: ${st.attempts}`) : h('span.badge', 'Nowe'));
  }
  paintStatus();

  const ws = createGuiWorkspace({
    files: task.files,
    saved: store.get().gui[id]?.files || {},
    checks: task.checks || [],
    domChecks: task.domChecks || [],
    runnable: task.runnable || null,
    onChange: (files) => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => store.update(() => { rec().files = files; }, { silent: true }), 500);
    },
    onChecked: (results) => {
      const all = results.length > 0 && results.every((r) => r.pass);
      const was = !!store.get().gui[id]?.solved;
      store.update(() => {
        const r = rec();
        r.attempts = (r.attempts || 0) + 1;
        r.files = ws.getFiles();
        if (all && !r.solved) { r.solved = true; r.solvedAt = new Date().toISOString(); }
      }, { scope: 'gui' });
      paintStatus();
      if (all && !was) {
        toast('Ćwiczenie zaliczone!', 'success');
        showSolution();
      }
    },
  });

  async function showSolution() {
    if (solutionHost.childElementCount) return;
    const names = Object.keys(task.solution || {});
    if (!names.length) return;
    let active = names[0];
    const codeEl = h('code.hljs');
    const pre = h('pre', codeEl);
    async function paint() {
      codeEl.innerHTML = await highlightCode(task.solution[active], langOfFile(active));
      pre.dataset.lang = active;
    }
    const tabs = h('div.tabs', { role: 'tablist' }, names.map((n) => h('button', {
      type: 'button',
      role: 'tab',
      'aria-selected': String(n === active),
      onclick: (e) => {
        active = n;
        tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b === e.currentTarget)));
        paint();
      },
    }, n)));
    await paint();
    append(solutionHost, h('section.card.solutions',
      h('h2', 'Przykładowe rozwiązanie'),
      h('p.small.muted', 'Porównaj ze swoim projektem. Możesz też wczytać rozwiązanie do edytorów i przenieść je do IDE.'),
      tabs, pre,
      h('button.btn.btn--sm', { type: 'button', onclick: () => ws.setFiles(task.solution) }, icon('copy'), 'Wczytaj do edytorów'),
      task.explanation ? h('p.small', { style: 'margin-top:1rem' }, task.explanation) : null
    ));
  }

  const hintBtn = h('button.btn.btn--ghost', {
    type: 'button',
    onclick: () => {
      if (hintsShown >= (task.hints || []).length) return;
      append(hintsHost, h('aside.callout.callout--info', h('div.callout__title', icon('bulb'), h('span', `Podpowiedź ${hintsShown + 1}`)), h('p', task.hints[hintsShown])));
      hintsShown++;
      if (hintsShown >= task.hints.length) hintBtn.disabled = true;
    },
  }, icon('bulb'), 'Podpowiedź');

  const solutionBtn = h('button.btn.btn--ghost', {
    type: 'button',
    onclick: async () => {
      if (!store.get().gui[id]?.solved) {
        const ok = await confirmDialog({ title: 'Pokazać rozwiązanie?', message: 'Spróbuj najpierw samodzielnie – na egzaminie nie będzie podpowiedzi.', confirmText: 'Pokaż' });
        if (!ok) return;
        store.update(() => { rec().usedSolution = true; }, { silent: true });
      }
      showSolution();
    },
  }, icon('eye'), 'Rozwiązanie');

  const resetBtn = h('button.btn.btn--ghost', {
    type: 'button',
    onclick: async () => {
      if (!(await confirmDialog({ title: 'Przywrócić pliki startowe?', message: 'Twoje zmiany we wszystkich plikach zostaną zastąpione szablonem.', confirmText: 'Przywróć' }))) return;
      ws.setFiles(Object.fromEntries(task.files.map((f) => [f.name, f.starter || ''])));
    },
  }, icon('refresh'), 'Reset');

  const prompt = await renderMarkdown(task.prompt);

  append(root,
    h('nav.breadcrumbs', h('a', { href: '#/gui' }, 'Pracownia GUI'), h('span', { 'aria-hidden': 'true' }, '/'), h('span', tech.label), h('span', { 'aria-hidden': 'true' }, '/'), h('span', task.title)),
    h('div.gui-task__head',
      h('div',
        h('div.page-head__eyebrow', `${tech.label} · ${tech.platformLabel || ''}`),
        h('div.lab-task__head', h('h1', task.title), statusBadge),
        h('div.lab-task__meta', difficulty(task.difficulty), ...(task.concepts || []).map((c) => h('span.badge', c)))
      ),
      h('div.btn-row', (task.hints || []).length ? hintBtn : null, solutionBtn, resetBtn)
    ),
    h('details.card.gui-task__prompt', { open: true }, h('summary', icon('book'), ' Polecenie'), prompt.el),
    hintsHost,
    ws.el,
    solutionHost,
    next ? h('nav.pager', h('span'), h('a.pager__link.pager__link--next', { href: `#/gui/${next.id}` }, h('span.small.faint', 'Następne ćwiczenie →'), h('strong', next.title))) : null
  );

  if (store.get().gui[id]?.solved) showSolution();

  return () => {
    clearTimeout(saveTimer);
    store.update(() => { rec().files = ws.getFiles(); }, { silent: true });
    ws.destroy();
  };
}

async function cheatSheet(root) {
  const md = await fetchText('./data/gui/sciaga.md');
  const { el, headings } = await renderMarkdown(md);
  document.title = 'Ściąga GUI · Pracownia GUI';
  append(root,
    h('nav.breadcrumbs', h('a', { href: '#/gui' }, 'Pracownia GUI'), h('span', { 'aria-hidden': 'true' }, '/'), h('span', 'Ściąga')),
    h('div.theory-layout',
      h('div.theory-main.theory-main--wide', el),
      h('aside.theory-aside', h('nav.toc', h('div.toc__title', 'Spis treści'),
        h('ol', headings.filter((x) => x.level === 2).map((x) => h('li', h('a', {
          href: location.hash,
          onclick: (e) => { e.preventDefault(); document.getElementById(x.id)?.scrollIntoView({ behavior: 'smooth' }); },
        }, x.text.replace(/#$/, '')))))))
    )
  );
}
