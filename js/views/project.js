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
import { createGuiWorkspace, langOfFile } from '../components/gui-workspace.js';
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

  const st = () => {
    const rec = (store.get().projects[id] ||= { checked: [], auto: {}, web: {}, score: 0, elapsedSec: 0 });
    rec.variant ||= {};
    rec.gui ||= {};
    return rec;
  };
  store.update(() => st(), { silent: true });
  const sandboxes = [];

  // ---------- Warianty technologiczne części GUI ----------
  // 'html' = wariant domyślny (part.starter / part.checks / part.criteria)
  const variantOf = (part) => {
    const vid = st().variant[part.id] || 'html';
    return vid === 'html' ? null : (part.variants || []).find((v) => v.id === vid) || null;
  };
  const autoKey = (part, v) => (v ? `${part.id}@${v.id}` : part.id);
  const partCriteria = (part) => {
    const v = part.type === 'web' ? variantOf(part) : null;
    return (v ? v.criteria || [] : part.criteria || []);
  };
  const partAuto = (part) => {
    if (part.type !== 'web') return [];
    const v = variantOf(part);
    return v ? [...(v.checks || []), ...(v.domChecks || [])] : part.checks || [];
  };

  // ---------- Punktacja ----------
  function computeScore() {
    const s = st();
    let earned = 0;
    let max = 0;
    for (const part of p.parts) {
      for (const c of partCriteria(part)) {
        max += c.points || 1;
        if (s.checked.includes(c.id)) earned += c.points || 1;
      }
      const passed = s.auto[autoKey(part, variantOf(part))] || [];
      for (const c of partAuto(part)) {
        max += c.points || 1;
        if (passed.includes(c.name)) earned += c.points || 1;
      }
    }
    return { earned, max, ratio: max ? earned / max : 0 };
  }

  const scoreHost = h('div.score-card__body');
  function paintScore() {
    const { earned, ratio, max: maxPoints } = computeScore();
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
      store.update((s) => {
        const old = s.projects[id] || {};
        s.projects[id] = { checked: [], auto: {}, web: old.web || {}, gui: old.gui || {}, variant: old.variant || {}, score: 0, elapsedSec: 0 };
      }, { scope: 'projects' });
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

    const criteriaList = (part, list, web) => h('div',
      h('h3.lab-sub', web ? 'Kryteria do samooceny (oprócz testów automatycznych)' : 'Kryteria oceniania – zaznacz spełnione'),
      h('ul.criteria', list.map((c) => {
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

    const solutionBox = (solution, fileMap = false) => {
      const details = h('details.solution-box', h('summary', icon('eye'), ' Przykładowe rozwiązanie (zajrzyj po swojej próbie)'));
      details.addEventListener('toggle', async () => {
        if (details.open && details.childElementCount === 1) details.append(await codeTabs(null, solution, fileMap));
      });
      return details;
    };

    if (part.type === 'web') {
      const envHost = h('div.variant-env');
      let current = null; // { destroy }

      async function renderVariant() {
        current?.destroy?.();
        const idx = sandboxes.indexOf(current);
        if (idx > -1) sandboxes.splice(idx, 1);
        const v = variantOf(part);
        const nodes = [];
        if (!v) {
          const sandbox = createWebSandbox({
            initial: st().web[part.id] || part.starter || {},
            checks: part.checks || [],
            onChange: (parts) => store.update((s) => { s.projects[id].web[part.id] = parts; }, { silent: true }),
            onChecked: (results) => {
              store.update((s) => { s.projects[id].auto[part.id] = results.filter((r) => r.pass).map((r) => r.name); }, { scope: 'projects' });
              paintScore();
            },
          });
          current = sandbox;
          nodes.push(h('h3.lab-sub', 'Środowisko pracy'), sandbox.el);
          if (part.criteria?.length) nodes.push(criteriaList(part, part.criteria, true));
          if (part.solution) nodes.push(solutionBox(part.solution));
        } else {
          const key = autoKey(part, v);
          const brief = await renderMarkdown(v.brief || '');
          const ws = createGuiWorkspace({
            files: v.files,
            saved: st().gui[key] || {},
            checks: v.checks || [],
            domChecks: v.domChecks || [],
            runnable: v.runnable || null,
            minLines: 16,
            onChange: (files) => store.update((s) => { s.projects[id].gui[key] = files; }, { silent: true }),
            onChecked: (results) => {
              store.update((s) => { s.projects[id].auto[key] = results.filter((r) => r.pass).map((r) => r.name); }, { scope: 'projects' });
              paintScore();
            },
          });
          current = ws;
          nodes.push(h('div.variant-brief', brief.el), h('h3.lab-sub', `Środowisko pracy – ${v.label}`), ws.el);
          if (v.criteria?.length) nodes.push(criteriaList(part, v.criteria, true));
          if (v.solution) nodes.push(solutionBox(v.solution, true));
        }
        sandboxes.push(current);
        setChildren(envHost, ...nodes);
      }

      if (part.variants?.length) {
        const opts = [{ id: 'html', label: 'HTML + CSS + JS', platform: 'web' }, ...part.variants];
        const groups = [['web', 'Web'], ['desktop', 'Desktop'], ['mobile', 'Mobile']];
        const picker = h('div.variant-picker',
          h('div.small.muted', { style: 'margin-bottom:.4rem' }, 'Technologia wykonania (jak na egzaminie – wybierasz sam):'),
          h('div.variant-picker__groups', groups.map(([g, gl]) => h('div.variant-picker__group',
            h('span.variant-picker__label', gl),
            h('div.segmented', { role: 'group', 'aria-label': `Technologie: ${gl}` },
              opts.filter((o) => o.platform === g).map((o) => h('button', {
                type: 'button',
                'data-variant': o.id,
                'aria-pressed': String((st().variant[part.id] || 'html') === o.id),
                onclick: async () => {
                  store.update((s) => { s.projects[id].variant[part.id] = o.id; }, { scope: 'projects' });
                  picker.querySelectorAll('button[data-variant]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.variant === o.id)));
                  await renderVariant();
                  paintScore();
                },
              }, o.label))
            )
          )))
        );
        section.append(picker);
      }
      section.append(envHost);
      await renderVariant();
    } else {
      if (part.criteria?.length) section.append(criteriaList(part, part.criteria, false));
      if (part.solution) section.append(solutionBox(part.solution));
    }
    partEls.push(section);
  }

  const intro = await renderMarkdown(p.intro);
  const { max: maxPoints } = computeScore();

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
    sandboxes.forEach((s) => s?.destroy?.());
  };
}

/** Zakładki z kodem w kilku językach + przycisk kopiowania. */
async function codeTabs(title, variants, fileMap = false) {
  const langs = Object.keys(variants);
  const pref = store.get().settings.codeLang;
  let active = !fileMap && langs.includes(pref) ? pref : langs[0];
  const codeEl = h('code.hljs');
  const pre = h('pre', codeEl);
  async function paint() {
    const lang = fileMap ? langOfFile(active) : ({ js: 'javascript', html: 'xml' }[active] || active);
    codeEl.innerHTML = await highlightCode(variants[active], lang);
    pre.dataset.lang = fileMap ? active : LANG_LABELS[active] || active;
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
  }, fileMap ? l : LANG_LABELS[l] || l)));
  const copyBtn = h('button.btn.btn--ghost.btn--sm', {
    type: 'button',
    onclick: async () => {
      try { await navigator.clipboard.writeText(variants[active]); toast('Skopiowano do schowka.', 'success'); } catch { toast('Nie udało się skopiować.', 'error'); }
    },
  }, icon('copy'), 'Kopiuj');
  await paint();
  return h('div.code-tabs', title ? h('h3.lab-sub', title) : null, h('div.code-tabs__bar', tabs, copyBtn), pre);
}
