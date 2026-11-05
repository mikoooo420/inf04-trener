// Sesja quizu w trybie nauki (także używana przez powtórki)
import { h, setChildren, append } from '../core/dom.js';
import { navigate, currentPath } from '../core/router.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { getCatalog } from '../engines/stats.js';
import { buildPracticeSet, saveAnswer } from '../engines/quiz-engine.js';
import { prepareQuestion, renderQuestionCard, bindAnswerKeys } from '../components/question-card.js';
import { progressBar } from '../components/progress.js';

export default async function quizView(root, { topic }) {
  const catalog = await getCatalog();
  const isMix = topic === 'mix';
  const topicDef = catalog.manifest.topics.find((t) => t.id === topic);
  if (!isMix && !topicDef) {
    append(root, h('div.empty', h('h2', 'Nie ma takiego działu'), h('a.btn', { href: '#/quiz' }, 'Wróć do listy')));
    return;
  }
  document.title = `Quiz: ${isMix ? 'mieszany' : topicDef.title} · INF.04 Trener`;
  const pool = isMix ? catalog.questions : catalog.questions.filter((q) => q.topic === topic);
  const size = Math.min(store.get().settings.quizSize || 10, pool.length);

  return runLearnSession(root, {
    title: isMix ? 'Quiz mieszany' : topicDef.title,
    backHref: '#/quiz',
    backLabel: 'Quizy',
    questions: buildPracticeSet(pool, size),
    catalog,
    restart: () => navigate(currentPath()),
  });
}

/**
 * Wspólny przebieg sesji nauki: pytanie po pytaniu → podsumowanie.
 * Zwraca funkcję sprzątającą (odpięcie skrótów klawiszowych).
 */
export async function runLearnSession(root, { title, backHref, backLabel, questions, catalog, restart, emptyMessage }) {
  if (!questions.length) {
    append(root, h('div.empty', icon('check'), h('h2', 'Brak pytań'), h('p', emptyMessage || 'Tu jeszcze nic nie ma.'), h('a.btn.btn--primary', { href: backHref }, backLabel)));
    return;
  }

  const topicTitle = (id) => catalog.manifest.topics.find((t) => t.id === id)?.title;
  const instances = questions.map((q) => prepareQuestion(q));
  let i = 0;
  let card = null;
  const results = [];

  const progressHost = h('div.quiz-progress');
  const stage = h('div.quiz-stage');
  const nextBtn = h('button.btn.btn--primary.btn--lg', { type: 'button', disabled: true, onclick: () => goNext() }, 'Dalej', icon('arrowRight'));
  const footer = h('div.quiz-footer', h('span.small.faint', h('kbd', '1–4'), ' wybór · ', h('kbd', 'Enter'), ' dalej'), nextBtn);

  append(root, 
    h('nav.breadcrumbs', h('a', { href: backHref }, backLabel), h('span', { 'aria-hidden': 'true' }, '/'), h('span', title)),
    h('header.quiz-head', h('h1', title), progressHost),
    stage,
    footer
  );

  async function show() {
    const inst = instances[i];
    setChildren(progressHost, 
      h('span.small.muted', `${i + 1} / ${instances.length}`),
      progressBar(i / instances.length, { label: 'Postęp quizu' })
    );
    nextBtn.disabled = true;
    setChildren(nextBtn, i === instances.length - 1 ? 'Zakończ' : 'Dalej', icon('arrowRight'));
    card = await renderQuestionCard(inst, {
      mode: 'learn',
      topicTitle: topicTitle(inst.q.topic),
      onAnswer: (correct) => {
        saveAnswer(inst.q.id, correct);
        results.push({ inst, correct });
        nextBtn.disabled = false;
        nextBtn.focus({ preventScroll: true });
      },
    });
    setChildren(stage, card);
    stage.querySelector('.answer')?.focus({ preventScroll: true });
  }

  function goNext() {
    if (instances[i].selected == null) return;
    if (i < instances.length - 1) {
      i++;
      show();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      summary();
    }
  }

  function summary() {
    card = null;
    const ok = results.filter((r) => r.correct).length;
    const ratio = ok / results.length;
    const wrong = results.filter((r) => !r.correct);
    setChildren(progressHost, progressBar(1, { variant: 'success', label: 'Ukończono' }));
    footer.remove();
    setChildren(stage, 
      h('div.card.result-card',
        h(`div.result-card__score.${ratio >= 0.75 ? 'is-good' : ratio >= 0.5 ? 'is-mid' : 'is-bad'}`, `${ok}/${results.length}`),
        h('h2', ratio >= 0.9 ? 'Znakomicie!' : ratio >= 0.75 ? 'Bardzo dobrze!' : ratio >= 0.5 ? 'Nieźle, ale jest co poprawić.' : 'Ten dział wymaga powtórki.'),
        h('p.muted', `Skuteczność ${Math.round(ratio * 100)}%. Błędne pytania trafiły do powtórek.`),
        h('div.btn-row', { style: 'justify-content:center' },
          restart ? h('button.btn.btn--primary', { type: 'button', onclick: restart }, icon('refresh'), 'Nowy zestaw') : null,
          wrong.length ? h('a.btn', { href: '#/powtorki' }, icon('repeat'), 'Powtórki') : null,
          h('a.btn.btn--ghost', { href: backHref }, backLabel)
        )
      ),
      wrong.length
        ? h('section.section',
            h('h2', 'Do przejrzenia'),
            h('div.review-list', wrong.map(({ inst }) =>
              h('details.review-item',
                h('summary', h('span.badge.badge--danger', 'Źle'), ' ', inst.q.question),
                h('p', h('strong', 'Poprawna odpowiedź: '), inst.q.answers[inst.q.correct]),
                h('p', h('strong', 'Twoja odpowiedź: '), inst.q.answers[inst.selected]),
                inst.q.explanation ? h('p.muted', inst.q.explanation) : null
              )
            ))
          )
        : null
    );
  }

  await show();
  return bindAnswerKeys(() => card, { onEnter: () => { if (!nextBtn.disabled) goNext(); } });
}
