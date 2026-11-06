// =========================================================
// STATS – wyliczanie postępów i statystyk z obiektu stanu
// =========================================================

import { getManifest, getAllQuestions, getSqlTasks, getCodeTasks, getProjects, getGui } from '../core/loader.js';
import { isMastered } from './leitner.js';
import { EXAM } from '../config.js';

let catalogPromise = null;

/** Wczytuje (raz) katalog wszystkich treści potrzebny do policzenia postępu. */
export function getCatalog() {
  if (!catalogPromise) {
    catalogPromise = Promise.all([
      getManifest(),
      getAllQuestions(),
      getSqlTasks().catch(() => []),
      getCodeTasks().catch(() => []),
      getProjects().catch(() => []),
      getGui().then((g) => g.tasks).catch(() => []),
    ]).then(([manifest, questions, sql, code, projects, gui]) => ({ manifest, questions, sql, code, projects, gui }));
    catalogPromise.catch(() => { catalogPromise = null; });
  }
  return catalogPromise;
}

const WEIGHTS = { theory: 0.17, questions: 0.3, code: 0.15, gui: 0.15, sql: 0.08, projects: 0.15 };

export function computeProgress(state, catalog) {
  const { manifest, questions, sql, code, projects, gui = [] } = catalog;
  const ratio = (a, b) => (b ? a / b : 0);

  const theoryDone = manifest.topics.filter((t) => state.theory[t.id]?.readAt).length;
  const qMastered = questions.filter((q) => isMastered(state.questions[q.id])).length;
  const qSeen = questions.filter((q) => state.questions[q.id]).length;
  const sqlDone = sql.filter((t) => state.sql[t.id]?.solved).length;
  const codeDone = code.filter((t) => state.code[t.id]?.solved).length;
  const guiDone = gui.filter((t) => state.gui?.[t.id]?.solved).length;
  const projDone = projects.filter((p) => (state.projects[p.id]?.score || 0) >= EXAM.practicalPassRatio).length;

  const parts = {
    theory: { done: theoryDone, total: manifest.topics.length, ratio: ratio(theoryDone, manifest.topics.length) },
    questions: { done: qMastered, seen: qSeen, total: questions.length, ratio: ratio(qMastered, questions.length) },
    code: { done: codeDone, total: code.length, ratio: ratio(codeDone, code.length) },
    gui: { done: guiDone, total: gui.length, ratio: ratio(guiDone, gui.length) },
    sql: { done: sqlDone, total: sql.length, ratio: ratio(sqlDone, sql.length) },
    projects: { done: projDone, total: projects.length, ratio: ratio(projDone, projects.length) },
  };
  const overall = Object.entries(WEIGHTS).reduce((acc, [k, w]) => acc + w * parts[k].ratio, 0);
  return { overall, parts };
}

/** Skuteczność w każdym dziale (na podstawie wszystkich odpowiedzi). */
export function topicAccuracy(state, catalog) {
  const byTopic = {};
  for (const t of catalog.manifest.topics) byTopic[t.id] = { ok: 0, bad: 0, total: 0, seen: 0, mastered: 0 };
  for (const q of catalog.questions) {
    const b = byTopic[q.topic];
    if (!b) continue;
    b.total++;
    const rec = state.questions[q.id];
    if (rec) {
      b.seen++;
      b.ok += rec.ok;
      b.bad += rec.bad;
      if (isMastered(rec)) b.mastered++;
    }
  }
  for (const b of Object.values(byTopic)) {
    b.accuracy = b.ok + b.bad ? b.ok / (b.ok + b.bad) : null;
  }
  return byTopic;
}

/** Seria dni nauki (liczona wstecz od dziś lub wczoraj). */
export function streak(activity) {
  const has = (d) => (activity[key(d)] || 0) > 0;
  const d = new Date();
  if (!has(d)) d.setDate(d.getDate() - 1);
  let n = 0;
  while (has(d)) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

function key(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export { key as dayKey };
