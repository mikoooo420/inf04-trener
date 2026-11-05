// =========================================================
// MAIN – punkt startowy aplikacji
// =========================================================

import { route, startRouter, onNavigate, navigate } from './core/router.js';
import { initTheme } from './core/theme.js';
import { initNav, setActive } from './components/navbar.js';
import { isAvailable } from './core/storage.js';
import { toast } from './components/toast.js';

// ---------- Trasy (widoki ładowane leniwie) ----------
route('', () => import('./views/home.js'), { nav: 'home' });
route('teoria', () => import('./views/theory-list.js'), { nav: 'teoria', title: 'Teoria w pigułce' });
route('teoria/:id', () => import('./views/theory-topic.js'), { nav: 'teoria', title: 'Teoria' });
route('quiz', () => import('./views/quiz-list.js'), { nav: 'quiz', title: 'Quizy tematyczne' });
route('quiz/:topic', () => import('./views/quiz.js'), { nav: 'quiz', title: 'Quiz' });
route('egzamin', () => import('./views/exam.js'), { nav: 'egzamin', title: 'Symulacja egzaminu' });
route('powtorki', () => import('./views/review.js'), { nav: 'powtorki', title: 'Powtórki' });
route('kod', () => import('./views/code-list.js'), { nav: 'kod', title: 'Code Lab' });
route('kod/:id', () => import('./views/code-task.js'), { nav: 'kod', title: 'Code Lab' });
route('sql', () => import('./views/sql-list.js'), { nav: 'sql', title: 'SQL Lab' });
route('sql/:id', () => import('./views/sql-task.js'), { nav: 'sql', title: 'SQL Lab' });
route('projekty', () => import('./views/projects-list.js'), { nav: 'projekty', title: 'Arkusze praktyczne' });
route('projekty/:id', () => import('./views/project.js'), { nav: 'projekty', title: 'Arkusz praktyczny' });
route('postepy', () => import('./views/dashboard.js'), { nav: 'postepy', title: 'Postępy' });
route('ustawienia', () => import('./views/settings.js'), { nav: 'ustawienia', title: 'Ustawienia' });
route('szukaj', () => import('./views/search.js'), { nav: null, title: 'Szukaj' });
route('szukaj/:q', () => import('./views/search.js'), { nav: null, title: 'Szukaj' });
route('*', () => import('./views/not-found.js'), { nav: null, title: 'Nie znaleziono' });

// ---------- Start ----------
initTheme();
initNav();
onNavigate(({ meta }) => setActive(meta.nav));

// Wyszukiwarka w topbarze
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (q) navigate(`/szukaj/${encodeURIComponent(q)}`);
});

// Skrót "/" – fokus na wyszukiwarce
document.addEventListener('keydown', (e) => {
  const tag = (e.target.tagName || '').toLowerCase();
  if (e.key === '/' && !['input', 'textarea', 'select'].includes(tag) && !e.target.isContentEditable) {
    e.preventDefault();
    searchInput.focus();
  }
});

startRouter();

if (!isAvailable()) {
  toast('Przeglądarka blokuje zapis danych – postępy nie zostaną zapamiętane.', 'warning', 6000);
}

// ---------- PWA: działanie offline ----------
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => console.warn('SW:', err));
  });
}
