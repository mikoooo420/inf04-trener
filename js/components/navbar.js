// =========================================================
// NAVBAR – menu boczne, dolna nawigacja (mobile), pierścień postępu
// =========================================================

import { h, clear } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { progressRing } from './progress.js';
import { getCatalog, computeProgress } from '../engines/stats.js';
import { dueQuestionIds } from '../engines/leitner.js';
import { APP_VERSION } from '../config.js';

export const NAV = [
  {
    title: 'Nauka',
    items: [
      { key: 'home', href: '#/', label: 'Start', icon: 'home' },
      { key: 'teoria', href: '#/teoria', label: 'Teoria w pigułce', icon: 'book' },
    ],
  },
  {
    title: 'Część pisemna',
    items: [
      { key: 'quiz', href: '#/quiz', label: 'Quizy tematyczne', icon: 'quiz' },
      { key: 'egzamin', href: '#/egzamin', label: 'Symulacja egzaminu', icon: 'exam' },
      { key: 'powtorki', href: '#/powtorki', label: 'Powtórki', icon: 'repeat', badge: 'due' },
    ],
  },
  {
    title: 'Część praktyczna',
    items: [
      { key: 'kod', href: '#/kod', label: 'Code Lab', icon: 'code' },
      { key: 'gui', href: '#/gui', label: 'Pracownia GUI', icon: 'layers' },
      { key: 'sql', href: '#/sql', label: 'SQL Lab', icon: 'database' },
      { key: 'projekty', href: '#/projekty', label: 'Arkusze praktyczne', icon: 'project' },
    ],
  },
  {
    title: 'Ty',
    items: [
      { key: 'postepy', href: '#/postepy', label: 'Postępy', icon: 'chart' },
      { key: 'ustawienia', href: '#/ustawienia', label: 'Ustawienia', icon: 'settings' },
    ],
  },
];

const BOTTOM = ['home', 'teoria', 'quiz', 'kod', 'postepy'];
const BOTTOM_LABELS = { home: 'Start', teoria: 'Teoria', quiz: 'Quizy', kod: 'Laby', postepy: 'Postępy' };

let activeKey = 'home';

export function renderNav() {
  const side = document.getElementById('sidebar-nav');
  const bottom = document.getElementById('bottom-nav');
  const due = dueQuestionIds(store.get().questions).length;

  clear(side).append(
    ...NAV.map((group) =>
      h('div.nav-group',
        h('div.nav-group__title', group.title),
        group.items.map((item) =>
          h('a.nav-link', { href: item.href, 'aria-current': item.key === activeKey ? 'page' : null },
            icon(item.icon),
            h('span', item.label),
            item.badge === 'due' && due > 0
              ? h('span.nav-link__badge.nav-link__badge--hot', { title: 'Pytania do powtórki' }, String(due))
              : null
          )
        )
      )
    ),
    h('div.sidebar__foot',
      h('p', 'Projekt open-source. Treści autorskie – nie są oficjalnymi materiałami CKE.'),
      h('p.faint', `Wersja ${APP_VERSION}`)
    )
  );

  const all = NAV.flatMap((g) => g.items);
  clear(bottom).append(
    ...BOTTOM.map((k) => {
      const item = all.find((i) => i.key === k);
      return h('a', { href: item.href, 'aria-current': k === activeKey ? 'page' : null }, icon(item.icon), BOTTOM_LABELS[k]);
    })
  );
}

export function setActive(key) {
  activeKey = key || 'home';
  renderNav();
  closeSidebar();
}

export async function updateProgressPill() {
  const ringHost = document.getElementById('progress-ring');
  const label = document.getElementById('progress-label');
  try {
    const catalog = await getCatalog();
    const { overall } = computeProgress(store.get(), catalog);
    clear(ringHost).append(progressRing(overall, { size: 28, stroke: 4 }));
    label.textContent = `${Math.round(overall * 100)}%`;
    document.getElementById('progress-pill').title = `Ogólny postęp: ${Math.round(overall * 100)}%`;
  } catch {
    clear(ringHost).append(progressRing(0));
  }
}

// ---------- Menu mobilne ----------
function openSidebar() {
  document.getElementById('sidebar').classList.add('is-open');
  document.getElementById('sidebar-backdrop').hidden = false;
  document.getElementById('menu-toggle').setAttribute('aria-expanded', 'true');
}
function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('is-open');
  const bd = document.getElementById('sidebar-backdrop');
  if (bd) bd.hidden = true;
  document.getElementById('menu-toggle')?.setAttribute('aria-expanded', 'false');
}

export function initNav() {
  renderNav();
  updateProgressPill();
  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.contains('is-open') ? closeSidebar() : openSidebar();
  });
  document.getElementById('sidebar-backdrop').addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSidebar(); });

  let t;
  store.on('change', () => {
    clearTimeout(t);
    t = setTimeout(() => { renderNav(); updateProgressPill(); }, 120);
  });
}
