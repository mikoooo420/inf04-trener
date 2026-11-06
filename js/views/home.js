// Strona główna – podsumowanie, szybki start, informacje o egzaminie
import { h, append } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { getCatalog, computeProgress, topicAccuracy, streak } from '../engines/stats.js';
import { dueQuestionIds } from '../engines/leitner.js';
import { progressRing, progressBar } from '../components/progress.js';
import { daysUntil, countLabel, plural } from '../utils/format.js';
import { EXAM } from '../config.js';

export default async function home(root) {
  const state = store.get();
  const catalog = await getCatalog();
  const { overall, parts } = computeProgress(state, catalog);
  const due = dueQuestionIds(state.questions).length;
  const days = daysUntil(state.settings.examDate);
  const st = streak(state.activity);

  // Sugestia "co dalej" – pierwszy nieprzeczytany temat lub najsłabszy dział
  const nextTopic = catalog.manifest.topics.find((t) => !state.theory[t.id]?.readAt);
  const acc = topicAccuracy(state, catalog);
  const weakest = Object.entries(acc)
    .filter(([, a]) => a.accuracy != null && a.ok + a.bad >= 3)
    .sort((a, b) => a[1].accuracy - b[1].accuracy)[0];
  const topicTitle = (id) => catalog.manifest.topics.find((t) => t.id === id)?.title || id;

  const suggestions = [];
  if (due > 0) suggestions.push({ href: '#/powtorki', icon: 'repeat', color: 'amber', title: `Powtórz ${countLabel(due, ['pytanie', 'pytania', 'pytań'])}`, text: 'System Leitnera przypomina pytania, z którymi był problem.' });
  if (nextTopic) suggestions.push({ href: `#/teoria/${nextTopic.id}`, icon: 'book', color: '', title: `Przeczytaj: ${nextTopic.title}`, text: nextTopic.description });
  if (weakest && weakest[1].accuracy < 0.75) suggestions.push({ href: `#/quiz/${weakest[0]}`, icon: 'target', color: 'red', title: `Podciągnij: ${topicTitle(weakest[0])}`, text: `Skuteczność ${Math.round(weakest[1].accuracy * 100)}% – poćwicz ten dział.` });
  if (!state.exams.length) suggestions.push({ href: '#/egzamin', icon: 'exam', color: 'green', title: 'Zrób pierwszą symulację', text: `${EXAM.questions} pytań, ${EXAM.minutes} minut – sprawdź, gdzie jesteś.` });
  if (suggestions.length < 3) suggestions.push({ href: '#/kod', icon: 'code', color: 'blue', title: 'Rozwiąż zadanie w Code Lab', text: 'Algorytmy z arkuszy CKE z automatycznymi testami.' });

  const hero = h('section.hero',
    h('div.hero__text',
      h('div.page-head__eyebrow', 'Egzamin zawodowy · Technik programista'),
      h('h1', 'Przygotuj się do INF.04 ', h('span.hero__accent', 'bez lania wody')),
      h('p.hero__lead', 'Teoria w pigułce z tipami egzaminacyjnymi, quizy w formacie CKE, symulacja egzaminu na czas, zadania z kodem (JS, TypeScript, Node.js) i SQL z automatycznym sprawdzaniem, pracownia aplikacji desktopowych, mobilnych i webowych oraz arkusze praktyczne. Wszystko działa w przeglądarce, postępy zapisują się lokalnie.'),
      h('div.btn-row',
        h('a.btn.btn--primary.btn--lg', { href: nextTopic ? `#/teoria/${nextTopic.id}` : '#/egzamin' }, icon('play'), nextTopic && overall < 0.05 ? 'Zacznij naukę' : 'Kontynuuj'),
        h('a.btn.btn--lg', { href: '#/egzamin' }, icon('exam'), 'Symulacja egzaminu')
      )
    ),
    h('div.hero__stats.card',
      h('div.hero__ring',
        progressRing(overall, { size: 132, stroke: 12 }),
        h('div.hero__ring-label', h('strong', `${Math.round(overall * 100)}%`), h('span', 'gotowości'))
      ),
      h('div.hero__mini',
        miniStat(st, plural(st, ['dzień', 'dni', 'dni']) + ' z rzędu', 'flame'),
        days != null
          ? miniStat(days >= 0 ? days : 0, days >= 0 ? plural(days, ['dzień', 'dni', 'dni']) + ' do egzaminu' : 'egzamin minął', 'calendar')
          : h('a.mini-stat.mini-stat--link', { href: '#/ustawienia' }, icon('calendar'), h('span', 'Ustaw datę egzaminu')),
        miniStat(state.exams.length, plural(state.exams.length, ['symulacja', 'symulacje', 'symulacji']), 'exam')
      )
    )
  );

  const suggestionsEl = h('section.section',
    h('div.section__title', h('h2', 'Co teraz?')),
    h('div.grid.grid--3',
      suggestions.slice(0, 3).map((s) =>
        h('a.card.tile', { href: s.href },
          h(`div.tile__icon${s.color ? '.tile__icon--' + s.color : ''}`, icon(s.icon)),
          h('h3', s.title),
          h('p', s.text)
        )
      )
    )
  );

  const modules = [
    { href: '#/teoria', icon: 'book', title: 'Teoria w pigułce', text: `${catalog.manifest.topics.length} działów z tipami CKE i pułapkami.`, p: parts.theory, unit: ['temat', 'tematy', 'tematów'] },
    { href: '#/quiz', icon: 'quiz', title: 'Quizy tematyczne', text: `${catalog.questions.length} pytań w formacie egzaminu.`, p: parts.questions, unit: ['opanowane', 'opanowane', 'opanowanych'], color: 'green' },
    { href: '#/kod', icon: 'code', title: 'Code Lab', text: 'Algorytmy, OOP, TypeScript i Node.js z testami.', p: parts.code, unit: ['zadanie', 'zadania', 'zadań'], color: 'blue' },
    { href: '#/gui', icon: 'layers', title: 'Pracownia GUI', text: 'WPF, WinForms, JavaFX, MAUI, Android, React, Angular.', p: parts.gui, unit: ['ćwiczenie', 'ćwiczenia', 'ćwiczeń'], color: 'red' },
    { href: '#/sql', icon: 'database', title: 'SQL Lab', text: 'Prawdziwy SQLite w przeglądarce, walidacja wyników.', p: parts.sql, unit: ['zadanie', 'zadania', 'zadań'], color: 'amber' },
    { href: '#/projekty', icon: 'project', title: 'Arkusze praktyczne', text: 'Symulacja części praktycznej: 180 min, kryteria, testy.', p: parts.projects, unit: ['arkusz', 'arkusze', 'arkuszy'], color: 'orange' },
    { href: '#/postepy', icon: 'chart', title: 'Postępy', text: 'Wyniki symulacji, słabe działy, eksport danych.', p: null, color: 'red' },
  ];

  const modulesEl = h('section.section',
    h('div.section__title', h('h2', 'Moduły')),
    h('div.grid.grid--3',
      modules.map((m) =>
        h('a.card.tile', { href: m.href },
          h(`div.tile__icon${m.color ? '.tile__icon--' + m.color : ''}`, icon(m.icon)),
          h('h3', m.title),
          h('p', m.text),
          m.p ? h('div.tile__foot',
            h('div', { style: 'flex:1' }, progressBar(m.p.ratio, { label: m.title })),
            h('span.nowrap', `${m.p.done}/${m.p.total}`)
          ) : null
        )
      )
    )
  );

  const examInfo = h('section.section',
    h('div.section__title', h('h2', 'Egzamin w liczbach')),
    h('div.grid.grid--2',
      h('div.card',
        h('h3', 'Część pisemna'),
        h('div.exam-facts',
          fact(EXAM.questions, 'pytań jednokrotnego wyboru'),
          fact(EXAM.minutes, 'minut na rozwiązanie'),
          fact(`${EXAM.passRatio * 100}%`, 'próg zdania')
        ),
        h('p.small.muted', 'Test komputerowy, 4 odpowiedzi, dokładnie jedna poprawna. Symulacja w aplikacji ma te same parametry.')
      ),
      h('div.card',
        h('h3', 'Część praktyczna'),
        h('div.exam-facts',
          fact(EXAM.practicalMinutes, 'minut na arkusz'),
          fact(`${EXAM.practicalPassRatio * 100}%`, 'próg zdania'),
          fact(3, 'typowe elementy arkusza')
        ),
        h('p.small.muted', 'Typowo: aplikacja konsolowa, aplikacja z interfejsem (desktop, mobile lub web) oraz dokumentacja. Zawsze czytaj aktualny informator CKE.')
      )
    )
  );

  append(root, hero, suggestionsEl, modulesEl, examInfo);
}

function miniStat(value, label, ic) {
  return h('div.mini-stat', icon(ic), h('strong', String(value)), h('span', label));
}

function fact(value, label) {
  return h('div.fact', h('strong', String(value)), h('span', label));
}
