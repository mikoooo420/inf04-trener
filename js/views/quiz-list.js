// Wybór działu do quizu
import { h, append } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { getCatalog, topicAccuracy } from '../engines/stats.js';
import { progressBar } from '../components/progress.js';

const SIZES = [10, 20, 40];

export default async function quizList(root) {
  const state = store.get();
  const catalog = await getCatalog();
  const acc = topicAccuracy(state, catalog);
  const size = state.settings.quizSize || 10;

  const chips = h('div.chips', { role: 'group', 'aria-label': 'Liczba pytań w quizie' },
    SIZES.map((n) => h('button.chip', {
      type: 'button',
      'aria-pressed': String(n === size),
      onclick: (e) => {
        store.update((s) => { s.settings.quizSize = n; }, { scope: 'settings', silent: true });
        chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === e.currentTarget)));
      },
    }, `${n} pytań`))
  );

  append(root, 
    h('header.page-head',
      h('div.page-head__eyebrow', 'Część pisemna'),
      h('h1', 'Quizy tematyczne'),
      h('p', 'Tryb nauki: po każdej odpowiedzi od razu widzisz, czy jest dobra, wraz z wyjaśnieniem i tipem CKE. Najpierw dostajesz pytania nowe i te, z którymi był problem. Skróty: 1–4 lub A–D wybierają odpowiedź, Enter przechodzi dalej.')
    ),
    h('div.quiz-toolbar', h('span.field__label', 'Długość quizu:'), chips),
    h('a.card.quiz-mix', { href: '#/quiz/mix' },
      h('div.tile__icon.tile__icon--green', icon('layers')),
      h('div',
        h('h3', 'Quiz mieszany'),
        h('p.muted.small', `Pytania ze wszystkich ${catalog.manifest.topics.length} działów – dobra rozgrzewka przed symulacją egzaminu.`)
      ),
      icon('arrowRight', 'quiz-mix__arrow')
    ),
    h('div.grid.grid--3', { style: 'margin-top:1rem' },
      catalog.manifest.topics.map((t) => {
        const a = acc[t.id];
        return h('a.card.tile', { href: `#/quiz/${t.id}` },
          h('div.tile__icon', icon(t.icon || 'quiz')),
          h('h3', t.title),
          h('p', `${a.total} pytań · opanowane ${a.mastered}`),
          h('div.tile__foot',
            h('div', { style: 'flex:1' }, progressBar(a.total ? a.mastered / a.total : 0, { variant: 'success', label: `Opanowanie: ${t.title}` })),
            h('span.nowrap', a.accuracy != null ? `${Math.round(a.accuracy * 100)}%` : '—')
          )
        );
      })
    )
  );
}
