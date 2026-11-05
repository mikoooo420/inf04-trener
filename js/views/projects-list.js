// Lista arkuszy praktycznych
import { h, append } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { getProjects } from '../core/loader.js';
import { difficulty, progressBar } from '../components/progress.js';
import { EXAM } from '../config.js';

export default async function projectsList(root) {
  const projects = await getProjects();
  const state = store.get();

  append(root, 
    h('header.page-head',
      h('div.page-head__eyebrow', 'Część praktyczna'),
      h('h1', 'Arkusze praktyczne'),
      h('p', `Treningowe arkusze w układzie zbliżonym do egzaminu: aplikacja konsolowa, aplikacja z interfejsem i dokumentacja. Masz ${EXAM.practicalMinutes} minut i listę kryteriów do samooceny. Część webową sprawdzają automatyczne testy. Próg zaliczenia: ${EXAM.practicalPassRatio * 100}%.`)
    ),
    h('div.grid.grid--2',
      projects.map((p) => {
        const st = state.projects[p.id];
        const score = st?.score || 0;
        return h('a.card.tile', { href: `#/projekty/${p.id}` },
          h('div.tile__icon.tile__icon--orange', icon('project')),
          h('h3', p.title),
          h('p', p.summary),
          h('div.chips', p.parts.map((part) => h('span.badge', part.title))),
          h('div.tile__foot',
            difficulty(p.difficulty),
            h('span', icon('clock'), ` ${p.durationMin} min`),
            h('div', { style: 'flex:1' }, progressBar(score, { variant: score >= EXAM.practicalPassRatio ? 'success' : '', label: `Wynik: ${p.title}` })),
            h('span.nowrap', st ? `${Math.round(score * 100)}%` : '—')
          )
        );
      })
    ),
    h('aside.callout.callout--cke', { style: 'margin-top:2rem' },
      h('div.callout__title', icon('star'), h('span', 'Jak trenować arkusze')),
      h('ul',
        h('li', 'Pierwsze podejście rób z timerem – egzamin to w dużej mierze zarządzanie czasem.'),
        h('li', 'Najpierw przeczytaj cały arkusz, potem zrób szkielet każdej części, dopiero później dopracowuj szczegóły.'),
        h('li', 'Nazwy klas, metod, plików i kontrolek muszą być dokładnie takie jak w poleceniu – za to są punkty.'),
        h('li', 'Zostaw 15–20 minut na dokumentację i zrzuty ekranu. To najłatwiejsze punkty, a najczęściej przepadają przez brak czasu.')
      )
    )
  );
}
