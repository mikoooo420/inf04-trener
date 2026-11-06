// =========================================================
// TS WORKER – kompilator TypeScript w osobnym wątku
//  • transpilacja TS/TSX → JS (także JSX dla Reacta)
//  • pełne sprawdzanie typów (strict) z komunikatami po polsku
//  Ładowany leniwie – tylko w zadaniach TypeScript i React.
// =========================================================
/* global tsLab */

'use strict';

const VENDOR = new URL('../../vendor/', self.location.href);
let ready = null;

function init() {
  if (!ready) {
    ready = (async () => {
      importScripts(new URL('typescript.min.js', VENDOR).href);
      const [libs, pl] = await Promise.all([
        fetch(new URL('ts-libs.json', VENDOR)).then((r) => r.json()),
        fetch(new URL('ts-pl.json', VENDOR)).then((r) => r.json()).catch(() => null),
      ]);
      tsLab.setup(libs, pl);
    })();
  }
  return ready;
}

self.onmessage = async (e) => {
  const { id, op, code, fileName } = e.data;
  try {
    await init();
    let result;
    if (op === 'check') result = { diagnostics: tsLab.check(code, fileName || 'main.ts') };
    else if (op === 'transpile') result = tsLab.transpile(code, fileName || 'main.tsx');
    else if (op === 'both') {
      // Uwaga: transpile zwraca własne (tylko składniowe) diagnostyki – nie mogą nadpisać błędów typów.
      const out = tsLab.transpile(code, fileName || 'main.ts');
      result = { code: out.code, diagnostics: tsLab.check(code, fileName || 'main.ts') };
    } else throw new Error('Nieznana operacja: ' + op);
    self.postMessage({ id, ok: true, result });
  } catch (err) {
    self.postMessage({ id, ok: false, error: err.message || String(err) });
  }
};
