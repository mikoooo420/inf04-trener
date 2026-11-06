// Lista zadań programistycznych
import { LANG_LABELS } from '../config.js';
import { h, append } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { getCodeTasks } from '../core/loader.js';
import { difficulty, progressBar } from '../components/progress.js';

export default async function codeList(root) {
  const tasks = await getCodeTasks();
  const state = store.get();
  const solved = tasks.filter((t) => state.code[t.id]?.solved).length;
  const groups = [...new Set(tasks.map((t) => t.group))];

  append(root, 
    h('header.page-head',
      h('div.page-head__eyebrow', 'Część praktyczna'),
      h('div.page-head__row',
        h('div',
          h('h1', 'Code Lab'),
          h('p', 'Klasyczne algorytmy i zadania obiektowe, które powtarzają się w arkuszach praktycznych. Piszesz w JavaScripcie (działa od razu w przeglądarce), a testy jednostkowe sprawdzają rozwiązanie. Po rozwiązaniu zobaczysz wzorcowy kod także w C++, C# i Pythonie – tak, jak napiszesz go na egzaminie.')
        ),
        h('div.card.card--pad-sm', { style: 'min-width:220px' },
          h('div.stat', h('span.stat__value', `${solved}/${tasks.length}`), h('span.stat__label', 'Rozwiązane')),
          h('div', { style: 'margin-top:.6rem' }, progressBar(solved / tasks.length, { variant: 'success', label: 'Rozwiązane zadania' }))
        )
      )
    ),
    h('aside.callout.callout--cke',
      h('div.callout__title', icon('star'), h('span', 'Jak to się ma do egzaminu?')),
      h('p', 'Na egzaminie piszesz w języku, który wybierzesz (np. C++, C#, Java, Python), w zainstalowanym IDE. Tutaj ćwiczysz to, co najważniejsze: logikę algorytmu, pętle, warunki i projektowanie klas. Składnię każdego języka masz w wzorcowych rozwiązaniach.')
    ),
    ...groups.map((g) =>
      h('section.section',
        h('div.section__title', h('h2', g)),
        h('ul.list-plain', tasks.filter((t) => t.group === g).map((t) => {
          const st = state.code[t.id];
          return h('li', h('a.list-row', { href: `#/kod/${t.id}` },
            h(`span.status-dot${st?.solved ? '.is-done' : st?.attempts ? '.is-partial' : ''}`, { 'aria-label': st?.solved ? 'Rozwiązane' : 'Nierozwiązane' }),
            h('div.list-row__main',
              h('div.list-row__title', t.title, t.lang && t.lang !== 'js' ? h('span.badge', { style: 'margin-left:.5rem' }, LANG_LABELS[t.lang] || t.lang) : null),
              h('div.list-row__sub', t.summary)
            ),
            difficulty(t.difficulty),
            icon('arrowRight')
          ));
        }))
      )
    )
  );
}
