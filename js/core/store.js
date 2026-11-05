// =========================================================
// STORE – centralny stan postępów + prosty system zdarzeń
//   store.get()               – aktualny obiekt postępów
//   store.update(fn)          – modyfikacja + zapis + zdarzenie 'change'
//   store.on('change', fn)    – subskrypcja (zwraca funkcję wypisania)
// =========================================================

import * as storage from './storage.js';
import { STORAGE_KEY } from '../config.js';

const listeners = new Map();
let state = storage.load();
let saveTimer = null;
let dirty = false;

function emit(event, payload) {
  for (const fn of listeners.get(event) || []) {
    try { fn(payload); } catch (err) { console.error(err); }
  }
}

export const store = {
  get() {
    return state;
  },

  /** fn otrzymuje stan do zmodyfikowania (mutowalnie). */
  update(fn, { silent = false, scope = 'any' } = {}) {
    fn(state);
    bumpActivity();
    scheduleSave();
    if (!silent) emit('change', { scope });
  },

  replace(newState) {
    state = newState;
    storage.save(state);
    emit('change', { scope: 'all' });
  },

  reset() {
    storage.clearAll();
    state = storage.createEmptyProgress();
    storage.save(state);
    emit('change', { scope: 'all' });
  },

  on(event, fn) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(fn);
    return () => listeners.get(event).delete(fn);
  },

  emit,

  /** Natychmiastowy zapis – tylko jeśli są niezapisane zmiany (nie nadpisuje danych z innej karty). */
  flush() {
    clearTimeout(saveTimer);
    if (dirty) { storage.save(state); dirty = false; }
  },
};

function scheduleSave() {
  dirty = true;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { storage.save(state); dirty = false; }, 150);
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function bumpActivity() {
  const k = todayKey();
  state.activity[k] = (state.activity[k] || 0) + 1;
}

export { todayKey };

// Synchronizacja między kartami: inna karta zapisała postępy → wczytaj je
window.addEventListener('storage', (e) => {
  if (e.key !== STORAGE_KEY || dirty) return;
  state = storage.load();
  emit('change', { scope: 'all' });
});

// Zapis przy zamykaniu karty (debounce mógłby nie zdążyć)
window.addEventListener('pagehide', () => store.flush());
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') store.flush();
});
