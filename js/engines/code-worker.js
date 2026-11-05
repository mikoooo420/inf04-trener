// =========================================================
// CODE WORKER – wykonuje kod użytkownika w osobnym wątku
//  • brak dostępu do DOM, LocalStorage i ciasteczek strony
//  • główny wątek ubija workera po przekroczeniu limitu czasu
// =========================================================
/* eslint-disable no-new-func */

'use strict';

// Blokujemy dostęp do sieci z kodu użytkownika
self.fetch = undefined;
self.XMLHttpRequest = undefined;
self.importScripts = undefined;
self.WebSocket = undefined;

function fmt(v, depth = 0) {
  if (typeof v === 'string') return depth ? JSON.stringify(v) : v;
  if (v === undefined) return 'undefined';
  if (typeof v === 'function') return `[Function ${v.name || 'anonimowa'}]`;
  if (typeof v === 'number' && !Number.isFinite(v)) return String(v);
  if (Array.isArray(v)) return depth > 2 ? '[…]' : `[${v.map((x) => fmt(x, depth + 1)).join(', ')}]`;
  if (v && typeof v === 'object') {
    if (depth > 2) return '{…}';
    const name = v.constructor && v.constructor !== Object ? v.constructor.name + ' ' : '';
    try {
      return name + '{ ' + Object.entries(v).map(([k, x]) => `${k}: ${fmt(x, depth + 1)}`).join(', ') + ' }';
    } catch { return String(v); }
  }
  return String(v);
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a) && Number.isNaN(b)) return true;
    return Math.abs(a - b) < 1e-9;
  }
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]));
}

const ERROR_PL = {
  ReferenceError: 'Błąd odwołania (użyto nieistniejącej zmiennej/funkcji)',
  TypeError: 'Błąd typu',
  SyntaxError: 'Błąd składni',
  RangeError: 'Błąd zakresu',
};

function describeError(err) {
  if (!err) return 'Nieznany błąd';
  const kind = ERROR_PL[err.name] ? `${ERROR_PL[err.name]}: ` : `${err.name || 'Błąd'}: `;
  return kind + (err.message || String(err));
}

function makeConsole(sink) {
  const push = (prefix) => (...args) => sink.push(prefix + args.map((a) => fmt(a)).join(' '));
  return { log: push(''), info: push(''), warn: push('⚠ '), error: push('✖ '), table: push(''), debug: push('') };
}

/** Kompiluje kod użytkownika + wyrażenie testowe w jedną funkcję. */
function compile(code, expr) {
  return new Function('console', '__args', `"use strict";\n${code}\n;return (${expr});`);
}

self.onmessage = (e) => {
  const { code, fn, tests = [], runTopLevel = true } = e.data;
  const logs = [];
  let topError = null;

  // 1) Zwykłe uruchomienie – do panelu konsoli
  if (runTopLevel) {
    try {
      new Function('console', `"use strict";\n${code}`)(makeConsole(logs));
    } catch (err) {
      topError = describeError(err);
    }
  }

  // 2) Testy
  const results = tests.map((t, i) => {
    const name = t.name || (t.args ? `${fn}(${t.args.map((a) => fmt(a, 1)).join(', ')})` : t.expr || `Test ${i + 1}`);
    try {
      let got;
      if (t.output !== undefined) {
        // Test wyjścia programu: porównujemy to, co wypisano przez console.log
        const out = [];
        new Function('console', '__input', `"use strict";\n${code}`)(makeConsole(out), t.input);
        got = out.join('\n').trim();
        const pass = got === String(t.output).trim();
        return { name: t.name || 'Wyjście programu', pass, expected: String(t.output), got, hidden: t.hidden };
      }
      const expr = t.expr || `${fn}(...__args)`;
      const args = t.args ? JSON.parse(JSON.stringify(t.args)) : [];
      got = compile(code, expr)(makeConsole([]), args);
      const pass = deepEqual(got, t.expected);
      return { name, pass, expected: fmt(t.expected, 1), got: fmt(got, 1), hidden: t.hidden };
    } catch (err) {
      return { name, pass: false, expected: t.output !== undefined ? String(t.output) : fmt(t.expected, 1), got: null, error: describeError(err), hidden: t.hidden };
    }
  });

  self.postMessage({ logs, topError, results });
};
