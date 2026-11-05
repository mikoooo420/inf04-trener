// =========================================================
// QUIZ ENGINE – losowanie pytań, układ egzaminu, zapis odpowiedzi
// =========================================================

import { store } from '../core/store.js';
import { recordAnswer } from './leitner.js';
import { shuffle } from '../utils/random.js';
import { EXAM } from '../config.js';

/** Zapisuje odpowiedź na pytanie w stanie (statystyki + Leitner). */
export function saveAnswer(questionId, correct) {
  store.update((s) => {
    s.questions[questionId] = recordAnswer(s.questions[questionId], correct);
  }, { scope: 'questions' });
}

/**
 * Losuje zestaw egzaminacyjny z zachowaniem proporcji działów (manifest.topics[].examWeight).
 * Jeśli w dziale brakuje pytań – uzupełnia z pozostałych.
 */
export function buildExamSet(questions, topics, count = EXAM.questions) {
  const byTopic = new Map();
  for (const q of questions) {
    if (!byTopic.has(q.topic)) byTopic.set(q.topic, []);
    byTopic.get(q.topic).push(q);
  }
  const totalWeight = topics.reduce((a, t) => a + (t.examWeight || 1), 0);
  const picked = [];
  const used = new Set();

  // Kwoty na dział (metoda największych reszt)
  const quotas = topics.map((t) => {
    const exact = (count * (t.examWeight || 1)) / totalWeight;
    return { id: t.id, base: Math.floor(exact), rest: exact - Math.floor(exact) };
  });
  let remaining = count - quotas.reduce((a, q) => a + q.base, 0);
  quotas.sort((a, b) => b.rest - a.rest).forEach((q) => { if (remaining > 0) { q.base++; remaining--; } });

  for (const { id, base } of quotas) {
    const pool = shuffle(byTopic.get(id) || []);
    for (const q of pool.slice(0, base)) { picked.push(q); used.add(q.id); }
  }
  // Uzupełnienie
  if (picked.length < count) {
    for (const q of shuffle(questions)) {
      if (picked.length >= count) break;
      if (!used.has(q.id)) { picked.push(q); used.add(q.id); }
    }
  }
  return shuffle(picked);
}

/** Wybiera pytania do quizu tematycznego – najpierw nowe i słabe, potem reszta. */
export function buildPracticeSet(questions, count, state = store.get()) {
  const score = (q) => {
    const rec = state.questions[q.id];
    if (!rec) return 0;               // nowe
    if (rec.lastCorrect === false) return 1; // ostatnio źle
    return 2 + (rec.box || 0);        // znane
  };
  const groups = new Map();
  for (const q of questions) {
    const s = score(q);
    if (!groups.has(s)) groups.set(s, []);
    groups.get(s).push(q);
  }
  const ordered = [...groups.keys()].sort((a, b) => a - b).flatMap((k) => shuffle(groups.get(k)));
  return shuffle(ordered.slice(0, count));
}

/** Podsumowanie wyników egzaminu per dział. */
export function summarizeByTopic(instances) {
  const out = {};
  for (const inst of instances) {
    const t = inst.q.topic;
    out[t] ||= [0, 0];
    out[t][1]++;
    if (inst.selected === inst.q.correct) out[t][0]++;
  }
  return out;
}
