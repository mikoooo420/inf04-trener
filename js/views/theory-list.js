// Lista działów teorii
import { h, append } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { getCatalog, topicAccuracy } from '../engines/stats.js';
import { progressBar } from '../components/progress.js';

export default async function theoryList(root) {
  const state = store.get();
  const catalog = await getCatalog();
  const { topics, groups } = catalog.manifest;
  const acc = topicAccuracy(state, catalog);
  const read = topics.filter((t) => state.theory[t.id]?.readAt).length;

  append(root, 
    h('header.page-head',
      h('div.page-head__eyebrow', 'Teoria w pigułce'),
      h('div.page-head__row',
        h('div',
          h('h1', 'Działy egzaminu INF.04'),
          h('p', 'Każdy dział to skrót najważniejszych pojęć z przykładami kodu, tipami CKE i pułapkami, na które łapią się zdający. Na końcu działu czeka mini-test.')
        ),
        h('div.card.card--pad-sm', { style: 'min-width:220px' },
          h('div.stat', h('span.stat__value', `${read}/${topics.length}`), h('span.stat__label', 'Przerobione działy')),
          h('div', { style: 'margin-top:.6rem' }, progressBar(read / topics.length, { variant: 'success', label: 'Przerobione działy' }))
        )
      )
    )
  );

  for (const group of groups) {
    const list = topics.filter((t) => t.group === group.id);
    if (!list.length) continue;
    append(root, 
      h('section.section',
        h('div.section__title', h('h2', group.title)),
        h('div.grid.grid--2',
          list.map((t) => {
            const done = !!state.theory[t.id]?.readAt;
            const a = acc[t.id];
            return h('a.card.topic-card', { href: `#/teoria/${t.id}` },
              h('div.topic-card__head',
                h('span.topic-card__icon', icon(t.icon || 'book')),
                h('h3', t.title),
                done ? h('span.badge.badge--success', icon('check'), 'Przerobione') : null
              ),
              h('p.muted.small', t.description),
              h('div.topic-card__meta',
                h('span', icon('clock'), ` ${t.minutes} min`),
                h('span', icon('quiz'), ` ${a?.total || 0} pytań`),
                a?.accuracy != null ? h('span', icon('target'), ` ${Math.round(a.accuracy * 100)}% skuteczności`) : null,
                h('span', icon('exam'), ` ~${t.examWeight} na egzaminie`)
              )
            );
          })
        )
      )
    );
  }
}
