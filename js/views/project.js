// =========================================================
// ARKUSZ PRAKTYCZNY – symulacja części praktycznej
//  timer 180 min · kryteria do samooceny · testy automatyczne części webowej
// =========================================================

import { h, setChildren, append } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { getProjects } from '../core/loader.js';
import { renderMarkdown, highlightCode } from '../utils/markdown.js';
import { createTimer } from '../components/timer.js';
import { createWebSandbox } from '../components/web-sandbox.js';
import { progressBar, difficulty } from '../components/progress.js';
import { confirmDialog } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { EXAM, LANG_LABELS } from '../config.js';

export default async function project(root, { id }) {
  const projects = await getProjects();
  const p = projects.find((x) => x.id === id);
  if (!p) {
    append(root, h('div.empty', h('h2', 'Nie ma takiego arkusza'), h('a.btn', { href: '#/projekty' }, 'Lista arkuszy')));
    return;
  }
  document.title = `${p.title} · Arkusze praktyczne`;

  const st = () => (store.get().projects[id] ||= { checked: [], auto: {}, web: {}, score: 0, elapsedSec: 0 });
  store.update(() => st(), { silent: true });
  const sandboxes = [];

  // ---------- Punktacja ----------
  const allCriteria = p.parts.flatMap((part) => (part.criteria || []).map((c) => ({ ...c, part: part.id })));
  const allAuto = p.parts.flatMap((part) => (part.checks || []).map((c) => ({ ...c, part: part.id })));
  const maxPoints = allCriteria.reduce((a, c) => a + (c.points || 1), 0) + allAuto.reduce((a, c) => a + (c.points || 1), 0);

  function computeScore() {
    const s = st();
    const crit = allCriteria.filter((c) => s.checked.includes(c.id)).reduce((a, c) => a + (c.points || 1), 0);
    const auto = allAuto.filter((c) => (s.auto[c.part] || []).includes(c.name)).reduce((a, c) => a + (c.points || 1), 0);
    return { earned: crit + auto, ratio: maxPoints ? (crit + auto) / maxPoints : 0 };
  }

  const scoreHost = h('div.score-card__body');
  function paintScore() {
    const { earned, ratio } = computeScore();
    const pass = ratio >= EXAM.practicalPassRatio;
    store.update((s) => { s.projects[id].score = ratio; }, { silent: true });
    setChildren(scoreHost, 
      h('div.score-card__value', h('strong', `${Math.round(ratio * 100)}%`), h('span.muted.small', ` ${earned}/${maxPoints} pkt`)),
      progressBar(ratio, { variant: pass ? 'success' : '', label: 'Wynik arkusza' }),
      h(`p.small.${pass ? 'score-pass' : 'muted'}`, { style: 'margin:.5rem 0 0' },
        pass ? 'Powyżej progu 75% – zaliczone!' : `Do progu brakuje ${Math.max(0, Math.ceil(maxPoints * EXAM.practicalPassRatio) - earned)} pkt.`)
    );
  }

  // ---------- Timer ----------
  const timer = createTimer(p.durationMin * 60, {
    startElapsed: st().elapsedSec || 0,
    warnAt: 1200,
    onEnd: () => {
      toast('Czas minął! Na egzaminie musiałbyś teraz oddać pracę.', 'warning', 6000);
      paintTimerBtn();
    },
  });
  const timerBtn = h('button.btn.btn--primary.btn--sm', { type: 'button' });
  function paintTimerBtn() {
    setChildren(timerBtn, icon(timer.running ? 'pause' : 'play'), timer.running ? 'Pauza' : (st().elapsedSec ? 'Wznów' : 'Start'));
  }
  timerBtn.addEventListener('click', () => {
    timer.running ? timer.pause() : timer.start();
    persistTime();
    paintTimerBtn();
  });
  const resetTimerBtn = h('button.btn.btn--ghost.btn--sm', {
    type: 'button',
    onclick: async () => {
      if (!(await confirmDialog({ title: 'Wyzerować arkusz?', message: 'Timer, zaznaczone kryteria i wyniki testów zostaną wyczyszczone (kod w edytorze zostaje).', confirmText: 'Wyzeruj', danger: true }))) return;
      store.update((s) => { s.projects[id] = { checked: [], auto: {}, web: s.projects[id]?.web || {}, score: 0, elapsedSec: 0 }; }, { scope: 'projects' });
      import('../core/router.js').then(({ navigate, currentPath }) => navigate(currentPath()));
    },
  }, icon('refresh'), 'Zeruj');
  function persistTime() {
    store.update((s) => { s.projects[id].elapsedSec = Math.round(timer.elapsed); }, { silent: true });
  }
  paintTimerBtn();
  const timeSaver = setInterval(() => { if (timer.running) persistTime(); }, 15000);

  // ---------- Części arkusza ----------
  const partEls = [];
  for (const [pi, part] of p.parts.entries()) {
    const brief = await renderMarkdown(part.brief);
    const section = h('section.card.part', { id: `part-${part.id}` },
      h('div.part__head', h('span.part__num', String(pi + 1)), h('h2', part.title), part.minutes ? h('span.badge', icon('clock'), ` ok. ${part.minutes} min`) : null),
      brief.el
    );

    if (part.starters) section.append(await codeTabs('Kod startowy / szablon', part.starters));

    if (part.type === 'web') {
      const savedWeb = st().web[part.id];
      const sandbox = createWebSandbox({
        initial: savedWeb || part.starter || {},
        checks: part.checks || [],
        onChange: (parts) => store.update((s) => { s.projects[id].web[part.id] = parts; }, { silent: true }),
        onChecked: (results) => {
          store.update((s) => { s.projects[id].auto[part.id] = results.filter((r) => r.pass).map((r) => r.name); }, { scope: 'projects' });
          paintScore();
        },
      });
      sandboxes.push(sandbox);
      section.append(h('h3.lab-sub', 'Środowisko pracy'), sandbox.el);
    }

    if (part.criteria?.length) {
      section.append(
        h('h3.lab-sub', part.type === 'web' ? 'Kryteria do samooceny (oprócz testów automatycznych)' : 'Kryteria oceniania – zaznacz spełnione'),
        h('ul.criteria', part.criteria.map((c) => {
          const input = h('input', {
            type: 'checkbox',
            checked: st().checked.includes(c.id),
            onchange: (e) => {
              store.update((s) => {
                const set = new Set(s.projects[id].checked);
                e.target.checked ? set.add(c.id) : set.delete(c.id);
                s.projects[id].checked = [...set];
              }, { scope: 'projects' });
              paintScore();
            },
          });
          return h('li', h('label.check', input, h('span', c.text, h('span.faint.small', ` (${c.points || 1} pkt)`))));
        }))
      );
    }

    if (part.solution) {
      const details = h('details.solution-box', h('summary', icon('eye'), ' Przykładowe rozwiązanie (zajrzyj po swojej próbie)'));
      details.addEventListener('toggle', async () => {
        if (details.open && details.childElementCount === 1) details.append(await codeTabs(null, part.solution));
      });
      section.append(details);
    }
    partEls.push(section);
  }

  const intro = await renderMarkdown(p.intro);

  append(root, 
    h('nav.breadcrumbs', h('a', { href: '#/projekty' }, 'Arkusze praktyczne'), h('span', { 'aria-hidden': 'true' }, '/'), h('span', p.title)),
    h('div.project-layout',
      h('div.project-main',
        h('header.page-head',
          h('div.page-head__eyebrow', 'Arkusz treningowy'),
          h('h1', p.title),
          h('div.lab-task__meta', difficulty(p.difficulty), h('span.badge', icon('clock'), ` ${p.durationMin} min`), h('span.badge', `${maxPoints} pkt`))
        ),
        h('div.card.part', intro.el),
        ...partEls
      ),
      h('aside.project-side',
        h('div.card.score-card',
          h('div.small.muted', 'Czas'),
          timer.el,
          h('div.btn-row', timerBtn, resetTimerBtn),
          h('hr'),
          h('div.small.muted', 'Wynik (samoocena + testy)'),
          scoreHost,
          h('hr'),
          h('nav.part-nav', p.parts.map((part, i) => h('a', {
            href: location.hash,
            onclick: (e) => { e.preventDefault(); document.getElementById(`part-${part.id}`)?.scrollIntoView({ behavior: 'smooth' }); },
          }, `${i + 1}. ${part.title}`)))
        )
      )
    )
  );
  paintScore();

  return () => {
    persistTime();
    timer.stop();
    clearInterval(timeSaver);
    sandboxes.forEach((s) => s.destroy());
  };
}

/** Zakładki z kodem w kilku językach + przycisk kopiowania. */
async function codeTabs(title, variants) {
  const langs = Object.keys(variants);
  const pref = store.get().settings.codeLang;
  let active = langs.includes(pref) ? pref : langs[0];
  const codeEl = h('code.hljs');
  const pre = h('pre', codeEl);
  async function paint() {
    const lang = { js: 'javascript', html: 'xml' }[active] || active;
    codeEl.innerHTML = await highlightCode(variants[active], lang);
    pre.dataset.lang = LANG_LABELS[active] || active;
  }
  const tabs = h('div.tabs', { role: 'tablist' }, langs.map((l) => h('button', {
    type: 'button',
    role: 'tab',
    'aria-selected': String(l === active),
    onclick: (e) => {
      active = l;
      tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b === e.currentTarget)));
      paint();
    },
  }, LANG_LABELS[l] || l)));
  const copyBtn = h('button.btn.btn--ghost.btn--sm', {
    type: 'button',
    onclick: async () => {
      try { await navigator.clipboard.writeText(variants[active]); toast('Skopiowano do schowka.', 'success'); } catch { toast('Nie udało się skopiować.', 'error'); }
    },
  }, icon('copy'), 'Kopiuj');
  await paint();
  return h('div.code-tabs', title ? h('h3.lab-sub', title) : null, h('div.code-tabs__bar', tabs, copyBtn), pre);
}
