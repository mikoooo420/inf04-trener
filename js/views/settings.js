// Ustawienia: motyw, język kodu, rozmiar tekstu, data egzaminu, kopia danych
import { h, append } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { applyTheme } from '../core/theme.js';
import { exportToFile, importFromFile } from '../core/storage.js';
import { confirmDialog } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { navigate } from '../core/router.js';
import { APP_VERSION } from '../config.js';

export default function settings(root) {
  const s = store.get().settings;

  const segmented = (label, options, current, onPick) => {
    const group = h('div.segmented', { role: 'group', 'aria-label': label },
      options.map(([val, text]) => h('button', {
        type: 'button',
        'aria-pressed': String(val === current),
        onclick: (e) => {
          group.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget)));
          onPick(val);
        },
      }, text))
    );
    return group;
  };

  const set = (fn) => store.update((st) => fn(st.settings), { scope: 'settings' });

  const fileInput = h('input', {
    type: 'file',
    accept: 'application/json,.json',
    hidden: true,
    onchange: async (e) => {
      const file = e.target.files[0];
      e.target.value = '';
      if (!file) return;
      try {
        const data = await importFromFile(file);
        const ok = await confirmDialog({
          title: 'Zastąpić obecne postępy?',
          message: 'Dane z pliku zastąpią wszystko, co jest zapisane w tej przeglądarce.',
          confirmText: 'Importuj',
          danger: true,
        });
        if (!ok) return;
        store.replace(data);
        applyTheme();
        toast('Postępy zaimportowane.', 'success');
        navigate('/postepy');
      } catch (err) {
        toast(err.message, 'error', 5000);
      }
    },
  });

  append(root, 
    h('header.page-head', h('div.page-head__eyebrow', 'Ty'), h('h1', 'Ustawienia')),
    h('div.settings',
      row('Motyw', 'Ciemny jest wygodniejszy wieczorem, jasny przy mocnym świetle.',
        segmented('Motyw', [['system', 'Systemowy'], ['dark', 'Ciemny'], ['light', 'Jasny']], s.theme, (v) => { set((x) => { x.theme = v; }); applyTheme(); })),
      row('Preferowany język kodu', 'W tym języku domyślnie pokażą się przykłady i wzorcowe rozwiązania (jeśli są dostępne).',
        segmented('Język kodu', [['cpp', 'C++'], ['csharp', 'C#'], ['java', 'Java'], ['python', 'Python'], ['js', 'JS']], s.codeLang, (v) => set((x) => { x.codeLang = v; }))),
      row('Rozmiar tekstu', 'Powiększa całą aplikację.',
        segmented('Rozmiar tekstu', [[0.9, 'Mały'], [1, 'Normalny'], [1.12, 'Duży'], [1.25, 'Bardzo duży']], s.fontScale, (v) => { set((x) => { x.fontScale = v; }); applyTheme(); })),
      row('Data egzaminu', 'Na stronie głównej pojawi się odliczanie.',
        h('input.input', {
          type: 'date',
          value: s.examDate || '',
          style: 'max-width:220px',
          'aria-label': 'Data egzaminu',
          onchange: (e) => set((x) => { x.examDate = e.target.value; }),
        })),
    ),
    h('section.section',
      h('h2', 'Twoje dane'),
      h('p.muted', 'Postępy są przechowywane wyłącznie w LocalStorage tej przeglądarki – nic nie jest wysyłane na serwer. Wyczyszczenie danych przeglądarki usuwa postępy, dlatego warto co jakiś czas pobrać kopię.'),
      h('div.btn-row',
        h('button.btn.btn--primary', { type: 'button', onclick: () => { exportToFile(store.get()); toast('Pobrano plik z postępami.', 'success'); } }, icon('download'), 'Eksportuj postępy (.json)'),
        h('button.btn', { type: 'button', onclick: () => fileInput.click() }, icon('upload'), 'Importuj z pliku'),
        fileInput,
        h('button.btn.btn--danger', {
          type: 'button',
          onclick: async () => {
            const ok = await confirmDialog({ title: 'Usunąć wszystkie postępy?', message: 'Tej operacji nie można cofnąć. Najpierw zrób eksport, jeśli chcesz zachować kopię.', confirmText: 'Usuń wszystko', danger: true });
            if (!ok) return;
            store.reset();
            applyTheme();
            toast('Postępy wyczyszczone.', 'success');
            navigate('/');
          },
        }, icon('trash'), 'Resetuj postępy')
      )
    ),
    h('section.section',
      h('h2', 'O projekcie'),
      h('p.muted', `INF.04 Trener v${APP_VERSION} – darmowy projekt open-source. Pytania i zadania są autorskie, przygotowane w stylu egzaminu; nie są oficjalnymi materiałami CKE. Aktualne informatory i arkusze znajdziesz na stronie Centralnej Komisji Egzaminacyjnej.`),
      h('div.btn-row',
        h('a.btn', { href: 'https://cke.gov.pl/egzamin-zawodowy/', target: '_blank', rel: 'noopener noreferrer' }, icon('external'), 'CKE – egzamin zawodowy')
      )
    )
  );
}

function row(title, desc, control) {
  return h('div.settings__row',
    h('div', h('h3', title), h('p.small.muted', desc)),
    h('div.settings__control', control)
  );
}
