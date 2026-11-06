// =========================================================
// STORAGE – zapis postępów w LocalStorage
//  • wersjonowany schemat + migracje
//  • eksport/import do pliku JSON (przenoszenie między urządzeniami)
//  • odporność na tryb prywatny / brak miejsca
// =========================================================

import { STORAGE_KEY, SCHEMA_VERSION, APP_VERSION } from '../config.js';

export function createEmptyProgress() {
  return {
    schema: SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    theory: {},     // { [topicId]: { readAt, miniQuiz } }
    questions: {},  // { [questionId]: { ok, bad, box, last } }
    exams: [],      // [{ date, score, max, durationSec, byTopic: { topic: [ok, total] } }]
    sql: {},        // { [taskId]: { solved, attempts, usedSolution, lastQuery, solvedAt } }
    code: {},       // { [taskId]: { solved, attempts, lastCode, solvedAt } }
    gui: {},        // { [taskId]: { solved, attempts, files: { [plik]: kod }, usedSolution } }
    projects: {},   // { [projectId]: { checked: [], score, web: { [partIdx]: code }, bestTimeSec } }
    activity: {},   // { 'YYYY-MM-DD': liczbaAkcji }
    settings: {
      theme: 'system',      // 'system' | 'dark' | 'light'
      codeLang: 'cpp',      // preferowany język w przykładach
      fontScale: 1,
      examDate: '',         // data egzaminu (YYYY-MM-DD) – odliczanie
    },
  };
}

/** Migracje: klucz = wersja, z której migrujemy. */
const MIGRATIONS = {
  // 1: (data) => { ...; data.schema = 2; return data; },
};

function migrate(data) {
  let d = data;
  while (d.schema < SCHEMA_VERSION && MIGRATIONS[d.schema]) {
    d = MIGRATIONS[d.schema](d);
  }
  return d;
}

/** Uzupełnia brakujące pola (np. po dodaniu nowej sekcji w nowej wersji). */
function withDefaults(data) {
  const base = createEmptyProgress();
  const out = { ...base, ...data };
  out.settings = { ...base.settings, ...(data.settings || {}) };
  for (const key of ['theory', 'questions', 'sql', 'code', 'gui', 'projects', 'activity']) {
    if (!out[key] || typeof out[key] !== 'object' || Array.isArray(out[key])) out[key] = {};
  }
  if (!Array.isArray(out.exams)) out.exams = [];
  return out;
}

let available = true;

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyProgress();
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return createEmptyProgress();
    return withDefaults(migrate(parsed));
  } catch (err) {
    console.warn('[storage] Nie udało się odczytać postępów:', err);
    available = false;
    return createEmptyProgress();
  }
}

export function save(data) {
  try {
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.warn('[storage] Nie udało się zapisać postępów:', err);
    available = false;
    return false;
  }
}

export function isAvailable() {
  return available;
}

export function clearAll() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

/** Pobiera plik .json z postępami. */
export function exportToFile(data) {
  const payload = { app: 'inf04-trener', appVersion: APP_VERSION, exportedAt: new Date().toISOString(), data };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `inf04-postepy-${date}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Wczytuje plik .json – zwraca obiekt postępów albo rzuca błąd z czytelnym komunikatem. */
export async function importFromFile(file) {
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Plik nie jest poprawnym JSON-em.');
  }
  const data = parsed && parsed.app === 'inf04-trener' ? parsed.data : parsed;
  if (!data || typeof data !== 'object' || typeof data.schema !== 'number') {
    throw new Error('To nie wygląda na plik z postępami INF.04 Trener.');
  }
  if (data.schema > SCHEMA_VERSION) {
    throw new Error('Plik pochodzi z nowszej wersji aplikacji. Zaktualizuj stronę i spróbuj ponownie.');
  }
  return withDefaults(migrate(data));
}
