// =========================================================
// KONFIGURACJA – stałe aplikacji w jednym miejscu
// =========================================================

export const APP_VERSION = '1.0.0';

/** Klucz w LocalStorage, pod którym trzymamy postępy. */
export const STORAGE_KEY = 'inf04.progress';

/** Aktualna wersja schematu postępów (zwiększ przy zmianie formatu + dopisz migrację w storage.js). */
export const SCHEMA_VERSION = 1;

/** Parametry egzaminu zgodne z formułą CKE (część pisemna i praktyczna). */
export const EXAM = {
  questions: 40,
  minutes: 60,
  passRatio: 0.5,
  practicalMinutes: 180,
  practicalPassRatio: 0.75,
};

/** System Leitnera – po ilu dniach pytanie z danego pudełka wraca do powtórki. */
export const LEITNER_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];
export const LEITNER_MAX_BOX = LEITNER_INTERVALS_DAYS.length - 1;

/** Limit czasu wykonania kodu użytkownika w Web Workerze (ms). */
export const CODE_TIMEOUT_MS = 3000;

/**
 * Biblioteki zewnętrzne.
 * marked, DOMPurify i highlight.js są dołączone lokalnie w /vendor (działają offline).
 * sql.js (SQLite w WebAssembly, ~1 MB) ładujemy z CDN dopiero po wejściu do SQL Lab.
 */
export const LIBS = {
  marked: './vendor/marked.umd.js',
  purify: './vendor/purify.min.js',
  hljs: './vendor/highlight.min.js',
  sqljs: 'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/sql-wasm.js',
  sqljsWasmDir: 'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/',
};

/** Etykiety języków programowania używane w pytaniach i ustawieniach. */
export const LANG_LABELS = {
  cpp: 'C++',
  csharp: 'C#',
  java: 'Java',
  python: 'Python',
  javascript: 'JavaScript',
  js: 'JavaScript',
  sql: 'SQL',
  html: 'HTML',
  xml: 'HTML',
  css: 'CSS',
};
