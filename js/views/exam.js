// =========================================================
// SYMULACJA EGZAMINU – 40 pytań, 60 minut, próg 50%
//  start → test (nawigacja, flagi, timer) → wynik i przegląd odpowiedzi
// =========================================================

import { h, setChildren, append } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { setLeaveGuard, navigate, currentPath } from '../core/router.js';
import { getCatalog } from '../engines/stats.js';
import { buildExamSet, saveAnswer, summarizeByTopic } from '../engines/quiz-engine.js';
import { prepareQuestion, renderQuestionCard, bindAnswerKeys } from '../components/question-card.js';
import { createTimer } from '../components/timer.js';
import { confirmDialog } from '../components/modal.js';
import { formatDuration, formatDate } from '../utils/format.js';
import { EXAM } from '../config.js';

export default async function exam(root) {
  const catalog = await getCatalog();
  const state = store.get();
  const last = state.exams.slice(-3).reverse();

  const startBtn = h('button.btn.btn--primary.btn--lg', { type: 'button' }, icon('play'), 'Rozpocznij egzamin');
  const stage = h('div.exam-stage');
  let cleanupFns = [];

  stage.append(
    h('header.page-head',
      h('div.page-head__eyebrow', 'Część pisemna'),
      h('h1', 'Symulacja egzaminu'),
      h('p', 'Warunki jak na prawdziwym egzaminie: losowy zestaw pytań z zachowaniem proporcji działów, odliczanie czasu i brak podpowiedzi. Wynik i wyjaśnienia zobaczysz dopiero po zakończeniu.')
    ),
    h('div.grid.grid--2',
      h('div.card.exam-rules',
        h('h2', 'Zasady'),
        h('ul',
          h('li', h('strong', `${EXAM.questions} pytań`), ' jednokrotnego wyboru (A–D)'),
          h('li', h('strong', `${EXAM.minutes} minut`), ' – po upływie czasu test kończy się automatycznie'),
          h('li', 'Próg zdania: ', h('strong', `${EXAM.passRatio * 100}%`), ` (${Math.ceil(EXAM.questions * EXAM.passRatio)} poprawnych)`),
          h('li', 'Możesz wracać do pytań, zmieniać odpowiedzi i oznaczać je flagą'),
          h('li', 'Skróty: ', h('kbd', '1–4'), ' odpowiedź, ', h('kbd', '←'), ' ', h('kbd', '→'), ' nawigacja')
        ),
        startBtn
      ),
      h('div.card',
        h('h2', 'Ostatnie podejścia'),
        last.length
          ? h('ul.list-plain', last.map((e) => {
              const pass = e.score / e.max >= EXAM.passRatio;
              return h('li.list-row',
                h(`span.badge.${pass ? 'badge--success' : 'badge--danger'}`, pass ? 'Zdany' : 'Niezdany'),
                h('div.list-row__main',
                  h('div.list-row__title', `${e.score}/${e.max} (${Math.round((e.score / e.max) * 100)}%)`),
                  h('div.list-row__sub', `${formatDate(e.date, true)} · ${formatDuration(e.durationSec)}`)
                )
              );
            }))
          : h('p.muted', 'Brak podejść. Pierwsza symulacja pokaże, które działy wymagają pracy.'),
        state.exams.length ? h('a.btn.btn--ghost.btn--sm', { href: '#/postepy' }, 'Pełna historia →') : null
      )
    )
  );

  append(root, stage);

  startBtn.addEventListener('click', () => runExam());

  async function runExam() {
    const set = buildExamSet(catalog.questions, catalog.manifest.topics, EXAM.questions);
    const instances = set.map((q) => prepareQuestion(q));
    const flags = new Set();
    let i = 0;
    let finished = false;
    let card = null;

    const timer = createTimer(EXAM.minutes * 60, { onEnd: () => finish(true), warnAt: 600 });
    const navGrid = h('div.exam-nav', { role: 'navigation', 'aria-label': 'Pytania' });
    const qHost = h('div.exam-question');
    const answeredLabel = h('span');
    const prevBtn = h('button.btn', { type: 'button', onclick: () => go(i - 1) }, icon('arrowLeft'), 'Poprzednie');
    const nextBtn = h('button.btn.btn--primary', { type: 'button', onclick: () => go(i + 1) }, 'Następne', icon('arrowRight'));
    const flagBtn = h('button.btn.btn--ghost', { type: 'button', onclick: toggleFlag }, icon('flag'), 'Oznacz');
    const finishBtn = h('button.btn.btn--success', { type: 'button', onclick: () => askFinish() }, icon('check'), 'Zakończ egzamin');

    function paintNav() {
      setChildren(navGrid, ...instances.map((inst, idx) =>
        h('button.exam-nav__item', {
          type: 'button',
          class: [inst.selected != null ? 'is-answered' : '', flags.has(idx) ? 'is-flagged' : '', idx === i ? 'is-current' : ''].join(' '),
          'aria-label': `Pytanie ${idx + 1}${inst.selected != null ? ', udzielono odpowiedzi' : ''}${flags.has(idx) ? ', oznaczone' : ''}`,
          'aria-current': idx === i ? 'true' : null,
          onclick: () => go(idx),
        }, String(idx + 1))
      ));
      const answered = instances.filter((x) => x.selected != null).length;
      answeredLabel.textContent = `Odpowiedzi: ${answered}/${instances.length}`;
      flagBtn.classList.toggle('is-active', flags.has(i));
      flagBtn.lastChild.textContent = flags.has(i) ? 'Oznaczone' : 'Oznacz';
    }

    async function go(idx) {
      if (idx < 0 || idx >= instances.length || finished) return;
      i = idx;
      card = await renderQuestionCard(instances[i], {
        mode: 'exam',
        index: i,
        total: instances.length,
        onSelect: () => paintNav(),
      });
      setChildren(qHost, card);
      prevBtn.disabled = i === 0;
      nextBtn.disabled = i === instances.length - 1;
      paintNav();
    }

    function toggleFlag() {
      flags.has(i) ? flags.delete(i) : flags.add(i);
      paintNav();
    }

    async function askFinish() {
      const unanswered = instances.filter((x) => x.selected == null).length;
      const ok = await confirmDialog({
        title: 'Zakończyć egzamin?',
        message: unanswered
          ? `Masz ${unanswered} pytań bez odpowiedzi${flags.size ? ` i ${flags.size} oznaczonych` : ''}. Pytania bez odpowiedzi liczą się jako błędne.`
          : 'Odpowiedziałeś na wszystkie pytania. Po zakończeniu zobaczysz wynik i wyjaśnienia.',
        confirmText: 'Zakończ',
      });
      if (ok) finish(false);
    }

    function finish(timeUp) {
      if (finished) return;
      finished = true;
      timer.stop();
      setLeaveGuard(null);
      window.removeEventListener('beforeunload', beforeUnload);
      cleanupFns.forEach((f) => f());
      cleanupFns = [];

      const score = instances.filter((x) => x.selected === x.q.correct).length;
      const byTopic = summarizeByTopic(instances);
      const durationSec = Math.round(timer.elapsed);
      for (const inst of instances) {
        if (inst.selected != null) saveAnswer(inst.q.id, inst.selected === inst.q.correct);
      }
      store.update((s) => {
        s.exams.push({ date: new Date().toISOString(), score, max: instances.length, durationSec, byTopic, timeUp });
      }, { scope: 'exams' });
      showResults({ instances, score, byTopic, durationSec, timeUp });
    }

    function beforeUnload(e) {
      e.preventDefault();
      e.returnValue = '';
    }

    setChildren(stage, 
      h('div.exam-bar',
        h('div.exam-bar__left', icon('exam'), h('strong', 'Egzamin INF.04 – symulacja'), answeredLabel),
        h('div.exam-bar__right', timer.el, finishBtn)
      ),
      h('div.exam-layout',
        h('div.exam-main', qHost, h('div.exam-controls', prevBtn, flagBtn, nextBtn)),
        h('aside.exam-side', h('div.card.card--pad-sm', h('div.small.muted', { style: 'margin-bottom:.5rem' }, 'Mapa pytań'), navGrid,
          h('div.exam-legend', h('span', h('i.lg.lg--answered'), 'odpowiedź'), h('span', h('i.lg.lg--flagged'), 'flaga'))))
      )
    );

    await go(0);
    timer.start();
    window.addEventListener('beforeunload', beforeUnload);
    setLeaveGuard(() => confirmDialog({
      title: 'Przerwać egzamin?',
      message: 'Trwa symulacja egzaminu. Jeśli wyjdziesz, odpowiedzi nie zostaną zapisane.',
      confirmText: 'Przerwij',
      danger: true,
    }));
    cleanupFns.push(
      bindAnswerKeys(() => card, { onNext: () => go(i + 1), onPrev: () => go(i - 1) }),
      () => timer.stop(),
      () => window.removeEventListener('beforeunload', beforeUnload)
    );
    window.scrollTo({ top: 0 });
  }

  function showResults({ instances, score, byTopic, durationSec, timeUp }) {
    const ratio = score / instances.length;
    const pass = ratio >= EXAM.passRatio;
    const topicTitle = (id) => catalog.manifest.topics.find((t) => t.id === id)?.title || id;
    let filter = 'wrong';
    const listHost = h('div.review-list');

    function paintList() {
      const items = instances
        .map((inst, idx) => ({ inst, idx }))
        .filter(({ inst }) => filter === 'all' || inst.selected !== inst.q.correct);
      setChildren(listHost, ...(items.length ? items.map(({ inst, idx }) => {
        const ok = inst.selected === inst.q.correct;
        return h('details.review-item',
          h('summary',
            h(`span.badge.${ok ? 'badge--success' : inst.selected == null ? 'badge--warning' : 'badge--danger'}`, ok ? 'Dobrze' : inst.selected == null ? 'Brak' : 'Źle'),
            ` ${idx + 1}. ${inst.q.question}`
          ),
          inst.q.code ? h('pre.q-code', h('code', [].concat(inst.q.code)[0].src)) : null,
          h('p', h('strong', 'Poprawna: '), inst.q.answers[inst.q.correct]),
          inst.selected != null && !ok ? h('p', h('strong', 'Twoja: '), inst.q.answers[inst.selected]) : null,
          inst.q.explanation ? h('p.muted', inst.q.explanation) : null,
          inst.q.tip ? h('p.small', h('strong', 'Tip CKE: '), inst.q.tip) : null
        );
      }) : [h('p.muted', 'Wszystkie odpowiedzi poprawne. Brawo!')]));
    }

    const filterBtns = h('div.segmented', { role: 'group', 'aria-label': 'Filtr' },
      [['wrong', 'Błędne i puste'], ['all', 'Wszystkie']].map(([val, label]) =>
        h('button', {
          type: 'button',
          'aria-pressed': String(val === filter),
          onclick: (e) => {
            filter = val;
            filterBtns.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget)));
            paintList();
          },
        }, label)
      )
    );

    setChildren(stage, 
      h('div.card.result-card.result-card--exam',
        h(`div.result-card__score.${pass ? 'is-good' : 'is-bad'}`, `${Math.round(ratio * 100)}%`),
        h('h1', pass ? 'Egzamin zdany!' : 'Tym razem się nie udało'),
        h('p.muted', `${score} z ${instances.length} poprawnych · próg ${Math.ceil(instances.length * EXAM.passRatio)} · czas ${formatDuration(durationSec)}${timeUp ? ' (upłynął limit)' : ''}`),
        h('div.btn-row', { style: 'justify-content:center' },
          h('button.btn.btn--primary', { type: 'button', onclick: () => navigate(currentPath()) }, icon('refresh'), 'Nowa symulacja'),
          h('a.btn', { href: '#/powtorki' }, icon('repeat'), 'Powtórz błędy'),
          h('a.btn.btn--ghost', { href: '#/postepy' }, 'Postępy')
        )
      ),
      h('section.section',
        h('h2', 'Wynik według działów'),
        h('div.topic-bars',
          Object.entries(byTopic)
            .sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1])
            .map(([t, [ok, total]]) => h('div.topic-bar',
              h('a.topic-bar__label', { href: `#/teoria/${t}` }, topicTitle(t)),
              h('div.topic-bar__track', h('div.topic-bar__fill', {
                class: ok / total >= 0.75 ? 'is-good' : ok / total >= 0.5 ? 'is-mid' : 'is-bad',
                style: `width:${(ok / total) * 100}%`,
              })),
              h('span.topic-bar__value', `${ok}/${total}`)
            ))
        )
      ),
      h('section.section',
        h('div.section__title', h('h2', 'Przegląd odpowiedzi'), filterBtns),
        listHost
      )
    );
    paintList();
    window.scrollTo({ top: 0 });
  }

  return () => {
    cleanupFns.forEach((f) => f());
    setLeaveGuard(null);
  };
}
