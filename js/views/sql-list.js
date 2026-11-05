// Lista zadań SQL
import { h, append } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { getSqlTasks } from '../core/loader.js';
import { difficulty, progressBar } from '../components/progress.js';

export default async function sqlList(root) {
  const tasks = await getSqlTasks();
  const state = store.get();
  const solved = tasks.filter((t) => state.sql[t.id]?.solved).length;
  const groups = [...new Set(tasks.map((t) => t.group))];

  append(root, 
    h('header.page-head',
      h('div.page-head__eyebrow', 'Część praktyczna · moduł wspierający'),
      h('div.page-head__row',
        h('div',
          h('h1', 'SQL Lab'),
          h('p', 'Prawdziwy SQLite działający w Twojej przeglądarce. Piszesz zapytanie, a aplikacja porównuje wynik z wzorcem i podpowiada, co jest nie tak. SQL jest głównie domeną INF.03, ale w INF.04 przydaje się przy aplikacjach korzystających z bazy danych.')
        ),
        h('div.card.card--pad-sm', { style: 'min-width:220px' },
          h('div.stat', h('span.stat__value', `${solved}/${tasks.length}`), h('span.stat__label', 'Rozwiązane')),
          h('div', { style: 'margin-top:.6rem' }, progressBar(solved / tasks.length, { variant: 'success', label: 'Rozwiązane zadania SQL' }))
        )
      )
    ),
    ...groups.map((g) =>
      h('section.section',
        h('div.section__title', h('h2', g)),
        h('ul.list-plain', tasks.filter((t) => t.group === g).map((t) => {
          const st = state.sql[t.id];
          return h('li', h('a.list-row', { href: `#/sql/${t.id}` },
            h(`span.status-dot${st?.solved ? '.is-done' : st?.attempts ? '.is-partial' : ''}`, { 'aria-label': st?.solved ? 'Rozwiązane' : 'Nierozwiązane' }),
            h('div.list-row__main',
              h('div.list-row__title', t.title),
              h('div.list-row__sub', `Baza: ${t.db} · ${t.concepts.join(', ')}`)
            ),
            difficulty(t.difficulty),
            icon('arrowRight')
          ));
        }))
      )
    )
  );
}
