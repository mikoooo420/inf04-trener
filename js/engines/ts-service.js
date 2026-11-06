// =========================================================
// TS SERVICE – interfejs do kompilatora TypeScript (Web Worker)
//   await tsCheck(code)            → [{ message, line, col }]
//   await tsTranspile(code, 'App.tsx') → { code, diagnostics }
// =========================================================

let worker = null;
let seq = 0;
const pending = new Map();

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./ts-worker.js', import.meta.url));
    worker.onmessage = (e) => {
      const { id, ok, result, error } = e.data;
      const p = pending.get(id);
      if (!p) return;
      pending.delete(id);
      ok ? p.resolve(result) : p.reject(new Error(error));
    };
    worker.onerror = (e) => {
      for (const p of pending.values()) p.reject(new Error('Kompilator TypeScript nie wystartował: ' + (e.message || '')));
      pending.clear();
      worker = null;
    };
  }
  return worker;
}

function call(op, code, fileName) {
  return new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ id, op, code, fileName });
  });
}

/** Usuwa artefakty modułów, których nie potrzebujemy w piaskownicy. */
function cleanOutput(js) {
  return js
    .replace(/^"use strict";\s*/m, '')
    .replace(/^Object\.defineProperty\(exports, "__esModule", \{ value: true \}\);\s*$/m, '')
    .replace(/^exports\.\w+ = .*;\s*$/gm, '');
}

export async function tsCheck(code, fileName = 'main.ts') {
  const { diagnostics } = await call('check', code, fileName);
  return diagnostics;
}

export async function tsTranspile(code, fileName = 'main.ts') {
  const r = await call('transpile', code, fileName);
  return { code: cleanOutput(r.code), diagnostics: r.diagnostics };
}

export async function tsCheckAndTranspile(code, fileName = 'main.ts') {
  const r = await call('both', code, fileName);
  return { code: cleanOutput(r.code), diagnostics: r.diagnostics };
}

/** Formatuje błąd kompilatora: „linia 3: Typu „string” nie można…” */
export function formatDiagnostic(d) {
  return d.line ? `linia ${d.line}, kol. ${d.col}: ${d.message}` : d.message;
}
