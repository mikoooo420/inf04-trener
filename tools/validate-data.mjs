#!/usr/bin/env node
// =========================================================
// Walidator treści – uruchamiany lokalnie i w GitHub Actions
//   node tools/validate-data.mjs
// Sprawdza poprawność JSON-ów, unikalność identyfikatorów
// i spójność odwołań (działy ↔ pliki, bazy SQL, testy zadań).
// =========================================================

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];
const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

function readJSON(rel) {
  const path = join(ROOT, rel);
  if (!existsSync(path)) { err(`Brak pliku: ${rel}`); return null; }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    err(`Niepoprawny JSON w ${rel}: ${e.message}`);
    return null;
  }
}

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;

// ---------- Manifest ----------
const manifest = readJSON('data/manifest.json');
const topicIds = new Set();
if (manifest) {
  const groupIds = new Set(manifest.groups.map((g) => g.id));
  for (const t of manifest.topics) {
    if (topicIds.has(t.id)) err(`manifest: zduplikowany dział ${t.id}`);
    topicIds.add(t.id);
    for (const f of ['title', 'description', 'group']) if (!isStr(t[f])) err(`manifest: dział ${t.id} – brak pola ${f}`);
    if (!groupIds.has(t.group)) err(`manifest: dział ${t.id} – nieznana grupa ${t.group}`);
    if (!existsSync(join(ROOT, `data/theory/${t.id}.md`))) err(`Brak teorii data/theory/${t.id}.md`);
  }
  const weights = manifest.topics.reduce((a, t) => a + (t.examWeight || 0), 0);
  if (weights !== 40) warn(`manifest: suma examWeight = ${weights} (oczekiwano 40)`);
}

// ---------- Pytania ----------
const questionIds = new Set();
let questionCount = 0;
for (const topic of topicIds) {
  const list = readJSON(`data/questions/${topic}.json`);
  if (!list) continue;
  if (!Array.isArray(list)) { err(`questions/${topic}.json: oczekiwano tablicy`); continue; }
  if (list.length < 5) warn(`questions/${topic}.json: tylko ${list.length} pytań`);
  for (const q of list) {
    const where = `questions/${topic}.json → ${q.id || '(brak id)'}`;
    questionCount++;
    if (!isStr(q.id)) err(`${where}: brak id`);
    else if (questionIds.has(q.id)) err(`${where}: zduplikowane id`);
    questionIds.add(q.id);
    if (!isStr(q.question)) err(`${where}: brak treści pytania`);
    if (!Array.isArray(q.answers) || q.answers.length < 2) err(`${where}: wymagane co najmniej 2 odpowiedzi`);
    else {
      if (q.answers.length !== 4) warn(`${where}: ${q.answers.length} odpowiedzi (format CKE to 4)`);
      if (new Set(q.answers).size !== q.answers.length) err(`${where}: powtarzające się odpowiedzi`);
      if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.answers.length) err(`${where}: niepoprawny indeks correct`);
    }
    if (!isStr(q.explanation)) warn(`${where}: brak wyjaśnienia (explanation)`);
    if (q.difficulty != null && ![1, 2, 3].includes(q.difficulty)) err(`${where}: difficulty musi być 1, 2 lub 3`);
    if (q.code) {
      for (const v of [].concat(q.code)) if (!isStr(v.lang) || !isStr(v.src)) err(`${where}: wariant kodu wymaga lang i src`);
    }
  }
}

// ---------- SQL ----------
const sql = readJSON('data/sql/tasks.json') || [];
const sqlIds = new Set();
for (const t of sql) {
  const where = `sql/tasks.json → ${t.id}`;
  if (sqlIds.has(t.id)) err(`${where}: zduplikowane id`);
  sqlIds.add(t.id);
  for (const f of ['title', 'prompt', 'solution', 'db', 'group']) if (!isStr(t[f])) err(`${where}: brak pola ${f}`);
  if (!existsSync(join(ROOT, `data/sql/db/${t.db}.sql`))) err(`${where}: brak bazy data/sql/db/${t.db}.sql`);
  if (t.mode === 'dml' && !isStr(t.check)) err(`${where}: zadanie DML wymaga zapytania check`);
  if (!Array.isArray(t.hints)) err(`${where}: hints musi być tablicą`);
}

// ---------- Code Lab ----------
const code = readJSON('data/code/tasks.json') || [];
const codeIds = new Set();
for (const t of code) {
  const where = `code/tasks.json → ${t.id}`;
  if (codeIds.has(t.id)) err(`${where}: zduplikowane id`);
  codeIds.add(t.id);
  for (const f of ['title', 'prompt', 'starter', 'fn', 'group']) if (!isStr(t[f])) err(`${where}: brak pola ${f}`);
  if (!Array.isArray(t.tests) || !t.tests.length) err(`${where}: brak testów`);
  for (const test of [...(t.tests || []), ...(t.hiddenTests || [])]) {
    if (!('expected' in test) && !('output' in test)) err(`${where}: test bez expected/output`);
    if (!test.args && !test.expr && !('output' in test)) err(`${where}: test bez args/expr`);
  }
  if (!t.solutions?.js) warn(`${where}: brak rozwiązania wzorcowego w JS`);
  // Wzorcowe rozwiązanie musi przechodzić wszystkie testy
  if (t.solutions?.js) {
    for (const test of [...(t.tests || []), ...(t.hiddenTests || [])]) {
      if (!('expected' in test)) continue;
      try {
        const expr = test.expr || `${t.fn}(...__args)`;
        // eslint-disable-next-line no-new-func
        const got = new Function('__args', `"use strict";\n${t.solutions.js}\n;return (${expr});`)(structuredClone(test.args || []));
        if (JSON.stringify(got) !== JSON.stringify(test.expected)) err(`${where}: rozwiązanie wzorcowe nie przechodzi testu ${test.name || JSON.stringify(test.args)}`);
      } catch (e) {
        err(`${where}: błąd rozwiązania wzorcowego – ${e.message}`);
      }
    }
  }
}

// ---------- Projekty ----------
const projects = readJSON('data/projects/projects.json') || [];
const critIds = new Set();
for (const p of projects) {
  const where = `projects.json → ${p.id}`;
  for (const f of ['title', 'intro', 'summary']) if (!isStr(p[f])) err(`${where}: brak pola ${f}`);
  for (const part of p.parts || []) {
    if (!isStr(part.brief)) err(`${where}/${part.id}: brak polecenia (brief)`);
    for (const c of part.criteria || []) {
      if (critIds.has(c.id)) err(`${where}: zduplikowane id kryterium ${c.id}`);
      critIds.add(c.id);
    }
    if (part.type === 'web' && !(part.checks || []).length) warn(`${where}/${part.id}: część web bez testów automatycznych`);
    const names = new Set();
    for (const c of part.checks || []) {
      if (names.has(c.name)) err(`${where}/${part.id}: zduplikowana nazwa testu „${c.name}”`);
      names.add(c.name);
    }
  }
}

// ---------- Raport ----------
console.log(`Działy: ${topicIds.size} · pytania: ${questionCount} · SQL: ${sql.length} · Code Lab: ${code.length} · arkusze: ${projects.length}`);
for (const w of warnings) console.log(`⚠  ${w}`);
for (const e of errors) console.log(`✖  ${e}`);
if (errors.length) {
  console.log(`\nZnaleziono błędy: ${errors.length}`);
  process.exit(1);
}
console.log('\n✔ Wszystkie dane są poprawne.');
