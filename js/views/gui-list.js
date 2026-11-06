// Pracownia GUI – lista technologii i ćwiczeń
import { h, append, setChildren } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { getGui } from '../core/loader.js';
import { difficulty, progressBar } from '../components/progress.js';

const PLATFORMS = [
  ['all', 'Wszystkie'],
  ['desktop', 'Desktop'],
  ['mobile', 'Mobile'],
  ['web', 'Web'],
];

let currentFilter = 'all';

export default async function guiList(root) {
  const { technologies, tasks } = await getGui();
  const state = store.get();
  const solved = tasks.filter((t) => state.gui[t.id]?.solved).length;
  const listHost = h('div.gui-techs');

  function paint() {
    setChildren(listHost, technologies
      .filter((tech) => currentFilter === 'all' || tech.platform === currentFilter)
      .map((tech) => {
        const list = tasks.filter((t) => t.tech === tech.id);
        const done = list.filter((t) => state.gui[t.id]?.solved).length;
        return h('section.card.gui-tech',
          h('div.gui-tech__head',
            h(`div.tile__icon.tile__icon--${tech.color || 'blue'}`, icon(tech.platform === 'mobile' ? 'project' : tech.platform === 'web' ? 'code' : 'layers')),
            h('div',
              h('h2', tech.label),
              h('p.small.muted', tech.description)
            ),
            h('span.badge', tech.platformLabel)
          ),
          h('p.small.faint.gui-tech__tools', icon('settings'), ` ${tech.tools}`),
          h('ul.list-plain', list.map((t) => {
            const st = state.gui[t.id];
            return h('li', h('a.list-row', { href: `#/gui/${t.id}` },
              h(`span.status-dot${st?.solved ? '.is-done' : st?.attempts ? '.is-partial' : ''}`, { 'aria-label': st?.solved ? 'Zaliczone' : 'Niezaliczone' }),
              h('div.list-row__main', h('div.list-row__title', t.title), h('div.list-row__sub', t.summary)),
              t.runnable ? h('span.badge.badge--info', 'podgląd na żywo') : null,
              difficulty(t.difficulty),
              icon('arrowRight')
            ));
          })),
          h('div.gui-tech__foot', progressBar(list.length ? done / list.length : 0, { variant: 'success', label: tech.label }), h('span.small.faint', `${done}/${list.length}`))
        );
      }));
  }

  const chips = h('div.chips', { role: 'group', 'aria-label': 'Platforma' },
    PLATFORMS.map(([val, label]) => h('button.chip', {
      type: 'button',
      'aria-pressed': String(val === currentFilter),
      onclick: (e) => {
        currentFilter = val;
        chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === e.currentTarget)));
        paint();
      },
    }, label))
  );

  append(root,
    h('header.page-head',
      h('div.page-head__eyebrow', 'Część praktyczna'),
      h('div.page-head__row',
        h('div',
          h('h1', 'Pracownia GUI'),
          h('p', 'Aplikacje z interfejsem we wszystkich popularnych technologiach egzaminacyjnych: WPF, Windows Forms, .NET MAUI, Android (Java i Kotlin), JavaFX, React, React + TypeScript i Angular. Piszesz layout i kod obsługi, a aplikacja sprawdza nazwy kontrolek, zdarzenia i logikę. Projekty React uruchamiają się na żywo.')
        ),
        h('div.card.card--pad-sm', { style: 'min-width:220px' },
          h('div.stat', h('span.stat__value', `${solved}/${tasks.length}`), h('span.stat__label', 'Zaliczone ćwiczenia')),
          h('div', { style: 'margin-top:.6rem' }, progressBar(tasks.length ? solved / tasks.length : 0, { variant: 'success', label: 'Zaliczone ćwiczenia GUI' }))
        )
      )
    ),
    h('a.card.quiz-mix', { href: '#/gui/sciaga' },
      h('div.tile__icon.tile__icon--amber', icon('book')),
      h('div', h('h3', 'Ściąga: te same kontrolki w 8 technologiach'), h('p.muted.small', 'Pole tekstowe, przycisk, lista, komunikat, obsługa kliknięcia i konwersja liczby – obok siebie w WPF, WinForms, MAUI, Androidzie, JavaFX, React i Angularze.')),
      icon('arrowRight', 'quiz-mix__arrow')
    ),
    h('aside.callout.callout--cke',
      h('div.callout__title', icon('star'), h('span', 'Jak to działa')),
      h('p', 'Aplikacji desktopowej czy mobilnej nie da się uruchomić w przeglądarce. Testy sprawdzają więc to, za co egzaminator przyznaje punkty: typy i nazwy kontrolek w layoucie, podpięte zdarzenia, istnienie metod obsługi, konwersję danych i komunikaty. Po zaliczeniu przenieś kod do swojego IDE (Visual Studio, Android Studio, IntelliJ) i uruchom go – to najlepszy trening przed egzaminem.')
    ),
    h('div.quiz-toolbar', h('span.field__label', 'Platforma:'), chips),
    listHost
  );
  paint();
}
