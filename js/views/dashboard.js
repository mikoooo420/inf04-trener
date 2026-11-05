// =========================================================
// POSTĘPY – statystyki, historia egzaminów, słabe działy, aktywność
// =========================================================

import { h, append } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { getCatalog, computeProgress, topicAccuracy, streak, dayKey } from '../engines/stats.js';
import { boxHistogram, dueQuestionIds } from '../engines/leitner.js';
import { progressBar, progressRing } from '../components/progress.js';
import { formatDate, formatDuration } from '../utils/format.js';
import { EXAM } from '../config.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
function svg(tag, attrs = {}, ...children) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  children.flat().forEach((c) => c && el.append(typeof c === 'string' ? document.createTextNode(c) : c));
  return el;
}

export default async function dashboard(root) {
  const state = store.get();
  const catalog = await getCatalog();
  const { overall, parts } = computeProgress(state, catalog);
  const acc = topicAccuracy(state, catalog);
  const exams = state.exams;
  const answered = Object.values(state.questions).reduce((a, r) => a + r.ok + r.bad, 0);
  const correct = Object.values(state.questions).reduce((a, r) => a + r.ok, 0);
  const bestExam = exams.length ? Math.max(...exams.map((e) => e.score / e.max)) : null;
  const passedExams = exams.filter((e) => e.score / e.max >= EXAM.passRatio).length;
  const topicTitle = (id) => catalog.manifest.topics.find((t) => t.id === id)?.title || id;

  // Gotowość: 3 ostatnie symulacje ≥ 75%
  const lastThree = exams.slice(-3);
  const ready = lastThree.length === 3 && lastThree.every((e) => e.score / e.max >= 0.75);

  append(root, 
    h('header.page-head',
      h('div.page-head__eyebrow', 'Ty'),
      h('div.page-head__row',
        h('div', h('h1', 'Twoje postępy'), h('p', 'Dane są zapisane tylko w tej przeglądarce. Zrób kopię w Ustawieniach, jeśli uczysz się na kilku urządzeniach.')),
        h('a.btn', { href: '#/ustawienia' }, icon('download'), 'Kopia zapasowa')
      )
    ),

    h('div.dash-top',
      h('div.card.dash-overall',
        h('div.hero__ring', progressRing(overall, { size: 120, stroke: 11 }), h('div.hero__ring-label', h('strong', `${Math.round(overall * 100)}%`), h('span', 'ogółem'))),
        h('div.dash-parts',
          partRow('Teoria', parts.theory, 'działów'),
          partRow('Pytania opanowane', parts.questions, 'pytań'),
          partRow('Code Lab', parts.code, 'zadań'),
          partRow('SQL Lab', parts.sql, 'zadań'),
          partRow('Arkusze ≥75%', parts.projects, 'arkuszy')
        )
      ),
      h('div.grid.grid--2.dash-stats',
        statCard(String(streak(state.activity)), 'Dni nauki z rzędu', 'flame', 'amber'),
        statCard(answered ? `${Math.round((correct / answered) * 100)}%` : '—', `Skuteczność (${answered} odp.)`, 'target', 'green'),
        statCard(bestExam != null ? `${Math.round(bestExam * 100)}%` : '—', `Najlepsza symulacja (${passedExams}/${exams.length} zdanych)`, 'trophy', 'blue'),
        statCard(String(dueQuestionIds(state.questions).length), 'Pytań do powtórki', 'repeat', 'red')
      )
    ),

    ready ? h('aside.callout.callout--formula', h('div.callout__title', icon('trophy'), h('span', 'Gotowy na egzamin!')),
      h('p', 'Trzy ostatnie symulacje powyżej 75%. Utrzymuj formę powtórkami i jednym arkuszem praktycznym w tygodniu.')) : null,

    h('section.section',
      h('div.section__title', h('h2', 'Wyniki symulacji egzaminu'), exams.length ? h('span.small.muted', `${exams.length} podejść`) : null),
      h('div.card', exams.length ? examChart(exams) : h('div.empty', h('p', 'Brak symulacji.'), h('a.btn.btn--primary', { href: '#/egzamin' }, 'Zrób pierwszą')))
    ),

    h('div.grid.grid--2.section',
      h('section',
        h('div.section__title', h('h2', 'Skuteczność w działach')),
        h('div.card.topic-bars',
          Object.entries(acc)
            .sort((a, b) => (a[1].accuracy ?? 2) - (b[1].accuracy ?? 2))
            .map(([id, a]) => h('div.topic-bar',
              h('a.topic-bar__label', { href: `#/quiz/${id}` }, topicTitle(id)),
              h('div.topic-bar__track', a.accuracy != null ? h('div.topic-bar__fill', {
                class: a.accuracy >= 0.75 ? 'is-good' : a.accuracy >= 0.5 ? 'is-mid' : 'is-bad',
                style: `width:${a.accuracy * 100}%`,
              }) : null),
              h('span.topic-bar__value', a.accuracy != null ? `${Math.round(a.accuracy * 100)}%` : '—')
            ))
        )
      ),
      h('section',
        h('div.section__title', h('h2', 'Aktywność (12 tygodni)')),
        h('div.card', heatmap(state.activity),
          h('h3.lab-sub', { style: 'margin-top:1.25rem' }, 'Pudełka Leitnera'),
          leitnerBars(boxHistogram(state.questions)))
      )
    ),

    exams.length ? h('section.section',
      h('div.section__title', h('h2', 'Historia symulacji')),
      h('div.table-wrap', h('table.data-table',
        h('thead', h('tr', h('th', 'Data'), h('th', 'Wynik'), h('th', 'Czas'), h('th', 'Najsłabszy dział'), h('th', 'Status'))),
        h('tbody', exams.slice().reverse().map((e) => {
          const weakest = Object.entries(e.byTopic || {}).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1])[0];
          const pass = e.score / e.max >= EXAM.passRatio;
          return h('tr',
            h('td', formatDate(e.date, true)),
            h('td', `${e.score}/${e.max} (${Math.round((e.score / e.max) * 100)}%)`),
            h('td', formatDuration(e.durationSec)),
            h('td', weakest ? `${topicTitle(weakest[0])} (${weakest[1][0]}/${weakest[1][1]})` : '—'),
            h('td', h(`span.badge.${pass ? 'badge--success' : 'badge--danger'}`, pass ? 'Zdany' : 'Niezdany'))
          );
        }))
      ))
    ) : null
  );
}

function partRow(label, p, unit) {
  return h('div.dash-part',
    h('div.dash-part__label', h('span', label), h('span.faint.small', `${p.done}/${p.total} ${unit}`)),
    progressBar(p.ratio, { variant: p.ratio >= 0.75 ? 'success' : '', label })
  );
}

function statCard(value, label, ic, color) {
  return h('div.card.card--pad-sm.stat-card',
    h(`div.tile__icon.tile__icon--${color}`, icon(ic)),
    h('div.stat', h('span.stat__value', value), h('span.stat__label', label))
  );
}

/** Wykres liniowy wyników (SVG, bez bibliotek). */
function examChart(exams) {
  const data = exams.slice(-20);
  const W = 640, H = 220, P = { l: 40, r: 16, t: 16, b: 28 };
  const x = (i) => P.l + (data.length === 1 ? (W - P.l - P.r) / 2 : (i * (W - P.l - P.r)) / (data.length - 1));
  const y = (v) => P.t + (1 - v) * (H - P.t - P.b);
  const pts = data.map((e, i) => [x(i), y(e.score / e.max)]);

  const grid = [0, 0.25, 0.5, 0.75, 1].map((v) => [
    svg('line', { x1: P.l, x2: W - P.r, y1: y(v), y2: y(v), class: 'chart-grid' }),
    svg('text', { x: P.l - 8, y: y(v) + 4, class: 'chart-axis', 'text-anchor': 'end' }, `${v * 100}%`),
  ]);
  const threshold = [
    svg('line', { x1: P.l, x2: W - P.r, y1: y(EXAM.passRatio), y2: y(EXAM.passRatio), class: 'chart-threshold' }),
    svg('text', { x: W - P.r, y: y(EXAM.passRatio) - 6, class: 'chart-axis chart-axis--danger', 'text-anchor': 'end' }, 'próg 50%'),
  ];
  const path = svg('path', { d: pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' '), class: 'chart-line' });
  const area = svg('path', { d: `M${pts[0][0]},${y(0)} ` + pts.map((p) => `L${p[0]},${p[1]}`).join(' ') + ` L${pts[pts.length - 1][0]},${y(0)} Z`, class: 'chart-area' });
  const dots = data.map((e, i) => {
    const pass = e.score / e.max >= EXAM.passRatio;
    return svg('circle', { cx: pts[i][0], cy: pts[i][1], r: 5, class: `chart-dot ${pass ? 'is-pass' : 'is-fail'}` },
      svg('title', {}, `${formatDate(e.date, true)}: ${e.score}/${e.max}`));
  });
  const labels = data.map((e, i) => (data.length <= 10 || i % Math.ceil(data.length / 10) === 0)
    ? svg('text', { x: pts[i][0], y: H - 8, class: 'chart-axis', 'text-anchor': 'middle' }, `#${exams.length - data.length + i + 1}`)
    : null);

  return h('div.chart',
    svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Wykres wyników ${data.length} ostatnich symulacji` },
      ...grid.flat(), area, ...threshold, path, ...dots, ...labels.filter(Boolean))
  );
}

/** Mapa aktywności – ostatnie 12 tygodni. */
function heatmap(activity) {
  const weeks = 12;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  const dow = (today.getDay() + 6) % 7; // poniedziałek = 0
  start.setDate(today.getDate() - dow - (weeks - 1) * 7);
  const max = Math.max(1, ...Object.values(activity));
  const cells = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const n = activity[dayKey(d)] || 0;
    const lvl = d > today ? -1 : n === 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4));
    cells.push(h('span.heat__cell', { class: `lvl-${lvl}`, title: `${d.toLocaleDateString('pl-PL')}: ${n} akcji` }));
  }
  return h('div.heat',
    h('div.heat__days', ['pn', '', 'śr', '', 'pt', '', 'nd'].map((d) => h('span', d))),
    h('div.heat__grid', { role: 'img', 'aria-label': 'Mapa aktywności z ostatnich 12 tygodni' }, cells),
    h('div.heat__legend', h('span.small.faint', 'mniej'), [0, 1, 2, 3, 4].map((l) => h('span.heat__cell', { class: `lvl-${l}` })), h('span.small.faint', 'więcej'))
  );
}

function leitnerBars(hist) {
  const max = Math.max(1, ...hist.slice(1));
  const labels = ['', 'Pudełko 1', 'Pudełko 2', 'Pudełko 3', 'Pudełko 4', 'Opanowane'];
  return h('div.leitner-bars', hist.slice(1).map((n, i) =>
    h('div.leitner-bars__col',
      h('div.leitner-bars__bar', { style: `height:${(n / max) * 100}%`, title: `${labels[i + 1]}: ${n}` }),
      h('strong', String(n)),
      h('span', labels[i + 1])
    )
  ));
}
