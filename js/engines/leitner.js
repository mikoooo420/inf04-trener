// =========================================================
// LEITNER – system powtórek rozłożonych w czasie
//  Pudełko 0 = nowe/błędne → wraca od razu
//  Dobra odpowiedź przesuwa pytanie do następnego pudełka (dłuższa przerwa)
//  Zła odpowiedź cofa je do pudełka 1
// =========================================================

import { LEITNER_INTERVALS_DAYS, LEITNER_MAX_BOX } from '../config.js';

const DAY = 86400000;

/** Aktualizuje rekord pytania po odpowiedzi (mutuje i zwraca). */
export function recordAnswer(rec, correct) {
  const r = rec || { ok: 0, bad: 0, box: 0, last: null };
  if (correct) {
    r.ok += 1;
    r.box = Math.min(LEITNER_MAX_BOX, (r.box || 0) + 1);
  } else {
    r.bad += 1;
    r.box = 1;
  }
  r.last = new Date().toISOString();
  r.lastCorrect = !!correct;
  return r;
}

export function isDue(rec, now = Date.now()) {
  if (!rec || !rec.last) return false;
  if (rec.box >= LEITNER_MAX_BOX) return false;
  // Pytania z ostatnią złą odpowiedzią są zawsze "do powtórki"
  if (rec.lastCorrect === false) return true;
  const interval = LEITNER_INTERVALS_DAYS[rec.box] ?? 0;
  return new Date(rec.last).getTime() + interval * DAY <= now;
}

/** Lista identyfikatorów pytań do powtórki – najpierw najniższe pudełka. */
export function dueQuestionIds(questionsState) {
  return Object.entries(questionsState)
    .filter(([, rec]) => isDue(rec))
    .sort(([, a], [, b]) => (a.box - b.box) || (new Date(a.last) - new Date(b.last)))
    .map(([id]) => id);
}

export function isMastered(rec) {
  return !!rec && rec.box >= 3;
}

export function boxHistogram(questionsState) {
  const hist = new Array(LEITNER_MAX_BOX + 1).fill(0);
  for (const rec of Object.values(questionsState)) hist[Math.min(rec.box || 0, LEITNER_MAX_BOX)]++;
  return hist;
}
