// =========================================================
// THEME – motyw jasny / ciemny / systemowy
// =========================================================

import { store } from './store.js';

const media = window.matchMedia('(prefers-color-scheme: dark)');

export function resolveTheme(pref) {
  if (pref === 'dark' || pref === 'light') return pref;
  return media.matches ? 'dark' : 'light';
}

export function applyTheme() {
  const { theme, fontScale } = store.get().settings;
  const resolved = resolveTheme(theme);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.setProperty('--font-scale', fontScale || 1);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = resolved === 'dark' ? '#11131a' : '#ffffff';
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.setAttribute('aria-label', resolved === 'dark' ? 'Włącz jasny motyw' : 'Włącz ciemny motyw');
}

export function toggleTheme() {
  const current = document.documentElement.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  store.update((s) => { s.settings.theme = next; }, { scope: 'settings' });
  applyTheme();
}

export function initTheme() {
  applyTheme();
  media.addEventListener('change', () => {
    if (store.get().settings.theme === 'system') applyTheme();
  });
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
}
