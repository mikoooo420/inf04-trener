// Powtórki – pytania wybrane przez system Leitnera
import { h, append } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { navigate, currentPath } from '../core/router.js';
import { getCatalog } from '../engines/stats.js';
import { dueQuestionIds, boxHistogram } from '../engines/leitner.js';
import { runLearnSession } from './quiz.js';
import { LEITNER_INTERVALS_DAYS } from '../config.js';

export default async function review(root) {
  const catalog = await getCatalog();
  const state = store.get();
  const ids = dueQuestionIds(state.questions);
  const byId = new Map(catalog.questions.map((q) => [q.id, q]));
  const questions = ids.map((id) => byId.get(id)).filter(Boolean).slice(0, 20);
  const hist = boxHistogram(state.questions);

  if (!questions.length) {
    append(root, 
      h('header.page-head',
        h('div.page-head__eyebrow', 'Część pisemna'),
        h('h1', 'Powtórki'),
        h('p', 'Każde pytanie, na które odpowiesz, trafia do jednego z pudełek. Dobra odpowiedź przesuwa je dalej (wraca rzadziej), zła cofa na początek. Tak działa system Leitnera – uczysz się tego, czego jeszcze nie umiesz.')
      ),
      h('div.card.empty',
        icon('check'),
        h('h2', 'Nic do powtórki'),
        h('p', Object.keys(state.questions).length
          ? 'Wszystkie pytania są na bieżąco. Wróć jutro albo zrób quiz z nowego działu.'
          : 'Zacznij od quizu – błędne odpowiedzi automatycznie trafią tutaj.'),
        h('a.btn.btn--primary', { href: '#/quiz' }, 'Przejdź do quizów')
      ),
      renderBoxes(hist)
    );
    return;
  }

  append(root, renderBoxes(hist));
  return runLearnSession(root, {
    title: `Powtórka (${questions.length})`,
    backHref: '#/quiz',
    backLabel: 'Quizy',
    questions,
    catalog,
    restart: () => navigate(currentPath()),
  });
}

function renderBoxes(hist) {
  const labels = ['Nowe', ...LEITNER_INTERVALS_DAYS.slice(1).map((d, i) => (i === LEITNER_INTERVALS_DAYS.length - 2 ? 'Opanowane' : `co ${d} ${d === 1 ? 'dzień' : 'dni'}`))];
  return h('div.leitner', { 'aria-label': 'Pudełka Leitnera' },
    hist.map((n, i) =>
      i === 0 ? null : h('div.leitner__box', { title: `Pudełko ${i}` },
        h('strong', String(n)),
        h('span', labels[i])
      )
    )
  );
}
