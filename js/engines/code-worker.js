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


// =========================================================
// TRYB NODE.JS – moduły CommonJS, wbudowana atrapa Express i wirtualny fs
// =========================================================

function matchPath(pattern, path) {
  const pp = pattern.split('/').filter(Boolean);
  const ap = path.split('/').filter(Boolean);
  if (pattern === '*' ) return {};
  if (pp.length !== ap.length) return null;
  const params = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(':')) params[pp[i].slice(1)] = decodeURIComponent(ap[i]);
    else if (pp[i] !== ap[i]) return null;
  }
  return params;
}

function createExpress(registry) {
  function express() {
    const stack = [];
    const app = {
      _stack: stack,
      use(pathOrFn, ...fns) {
        if (typeof pathOrFn === 'function') stack.push({ method: '*', path: null, handlers: [pathOrFn, ...fns] });
        else stack.push({ method: '*', path: pathOrFn, prefix: true, handlers: fns });
        return app;
      },
      listen(port, cb) { if (typeof cb === 'function') cb(); return { close() {} }; },
      set() { return app; },
    };
    for (const m of ['get', 'post', 'put', 'patch', 'delete', 'all']) {
      app[m] = (path, ...handlers) => { stack.push({ method: m === 'all' ? '*' : m.toUpperCase(), path, handlers }); return app; };
    }
    registry.app = app;
    return app;
  }
  express.json = () => function jsonParser(req, res, next) { next(); };
  express.urlencoded = () => function urlencoded(req, res, next) { next(); };
  express.static = () => function serveStatic(req, res, next) { next(); };
  express.Router = () => {
    const r = express();
    return r;
  };
  return express;
}

async function handleRequest(app, { method = 'GET', url = '/', body, headers = {} }) {
  const [path, qs = ''] = url.split('?');
  const query = Object.fromEntries(new URLSearchParams(qs));
  const res = { statusCode: 200, body: undefined, headers: {}, finished: false };
  const resApi = {
    status(code) { res.statusCode = code; return resApi; },
    json(obj) { res.body = JSON.parse(JSON.stringify(obj === undefined ? null : obj)); res.finished = true; return resApi; },
    send(x) { res.body = typeof x === 'object' && x !== null ? JSON.parse(JSON.stringify(x)) : x; res.finished = true; return resApi; },
    sendStatus(code) { res.statusCode = code; res.body = String(code); res.finished = true; return resApi; },
    end() { res.finished = true; return resApi; },
    set(k, v) { res.headers[String(k).toLowerCase()] = v; return resApi; },
    header(k, v) { return resApi.set(k, v); },
    setHeader(k, v) { return resApi.set(k, v); },
  };
  const req = { method: method.toUpperCase(), url, path, query, params: {}, body: body === undefined ? {} : JSON.parse(JSON.stringify(body)), headers };

  // Spłaszcz routery zamontowane przez app.use('/prefix', router)
  const layers = [];
  (function collect(stack, prefix) {
    for (const l of stack) {
      if (l.prefix && l.handlers.length === 1 && l.handlers[0] && l.handlers[0]._stack) {
        collect(l.handlers[0]._stack, prefix + l.path.replace(/\/$/, ''));
      } else {
        layers.push({ ...l, path: l.path == null ? null : (l.prefix ? prefix + l.path : prefix + l.path) });
      }
    }
  })(app._stack, '');

  for (const layer of layers) {
    if (res.finished) break;
    if (layer.method !== '*' && layer.method !== req.method) continue;
    let params = {};
    if (layer.path != null) {
      if (layer.prefix) { if (!(path === layer.path || path.startsWith(layer.path.replace(/\/$/, '') + '/'))) continue; }
      else { params = matchPath(layer.path, path); if (!params) continue; }
    }
    req.params = params;
    for (const h of layer.handlers) {
      if (res.finished) break;
      let calledNext = false;
      let nextErr = null;
      await h(req, resApi, (err) => { calledNext = true; nextErr = err || null; });
      if (nextErr) throw nextErr;
      if (!calledNext) break;
    }
  }
  if (!res.finished) return { status: 404, body: `Cannot ${req.method} ${path}` };
  return { status: res.statusCode, body: res.body };
}

function createFs(files) {
  const vfs = { ...(files || {}) };
  const notFound = (p) => Object.assign(new Error(`ENOENT: no such file or directory, open '${p}'`), { code: 'ENOENT' });
  return {
    readFileSync(p) { if (!(p in vfs)) throw notFound(p); return vfs[p]; },
    writeFileSync(p, data) { vfs[p] = String(data); },
    appendFileSync(p, data) { vfs[p] = (vfs[p] || '') + String(data); },
    existsSync(p) { return p in vfs; },
    unlinkSync(p) { if (!(p in vfs)) throw notFound(p); delete vfs[p]; },
    readdirSync() { return Object.keys(vfs); },
    promises: {
      readFile: async (p) => { if (!(p in vfs)) throw notFound(p); return vfs[p]; },
      writeFile: async (p, d) => { vfs[p] = String(d); },
    },
    _vfs: vfs,
  };
}

const pathModule = {
  join: (...parts) => parts.join('/').replace(/\/+/g, '/'),
  basename: (p, ext) => { const b = p.split('/').pop(); return ext && b.endsWith(ext) ? b.slice(0, -ext.length) : b; },
  extname: (p) => { const b = p.split('/').pop(); const i = b.lastIndexOf('.'); return i > 0 ? b.slice(i) : ''; },
  dirname: (p) => p.split('/').slice(0, -1).join('/') || '.',
  resolve: (...parts) => '/' + parts.join('/').replace(/^\/+/, ''),
  sep: '/',
};

/** Uruchamia kod jako moduł Node.js i zwraca { exports, registry, fs } */
function runNodeModule(code, consoleObj, { argv = [], files } = {}) {
  const registry = { app: null };
  const fs = createFs(files);
  const express = createExpress(registry);
  const modules = { express, fs, path: pathModule, 'node:fs': fs, 'node:path': pathModule };
  const require = (name) => {
    if (name in modules) return modules[name];
    throw new Error(`Moduł „${name}” nie jest dostępny w piaskownicy (dostępne: express, fs, path).`);
  };
  const module = { exports: {} };
  const out = [];
  const proc = {
    argv: ['node', 'app.js', ...argv.map(String)],
    env: {},
    exit() {},
    stdout: { write: (s) => { consoleObj.log(String(s).replace(/\n$/, '')); return true; } },
  };
  new Function('module', 'exports', 'require', 'process', 'console', `"use strict";\n${code}`)(module, module.exports, require, proc, consoleObj);
  return { exports: module.exports, registry, fs, out };
}

async function runNodeTests({ code, tests = [], runTopLevel = true }) {
  const logs = [];
  let topError = null;
  if (runTopLevel) {
    try { runNodeModule(code, makeConsole(logs)); } catch (err) { topError = describeError(err); }
  }
  const results = [];
  for (const [i, t] of tests.entries()) {
    const name = t.name || t.expr || `Test ${i + 1}`;
    try {
      const out = [];
      const mod = runNodeModule(code, makeConsole(out), { argv: t.argv, files: t.files });
      if (t.output !== undefined) {
        const got = out.join('\n').trim();
        results.push({ name, pass: got === String(t.output).trim(), expected: String(t.output), got, hidden: t.hidden });
      } else if (t.http) {
        if (!mod.registry.app) throw new Error('Nie utworzono aplikacji: const app = express();');
        let err = null;
        for (const rq of t.http) {
          const r = await handleRequest(mod.registry.app, rq);
          const exp = rq.expect || {};
          if (exp.status != null && r.status !== exp.status) {
            err = { expected: `${rq.method || 'GET'} ${rq.url} → status ${exp.status}`, got: `status ${r.status} ${fmt(r.body, 1)}` };
            break;
          }
          if ('body' in exp && !deepEqual(r.body, exp.body)) {
            err = { expected: `${rq.method || 'GET'} ${rq.url} → ${fmt(exp.body, 1)}`, got: fmt(r.body, 1) };
            break;
          }
        }
        results.push({ name, pass: !err, expected: err?.expected, got: err?.got, hidden: t.hidden });
      } else if (t.fsExpect) {
        let fail = null;
        for (const [f, content] of Object.entries(t.fsExpect)) {
          const got = mod.fs._vfs[f];
          if (got === undefined || String(got).trim() !== String(content).trim()) { fail = { expected: `${f}: ${content}`, got: got === undefined ? `brak pliku ${f}` : got }; break; }
        }
        results.push({ name, pass: !fail, expected: fail?.expected, got: fail?.got, hidden: t.hidden });
      } else {
        // Wyrażenie z dostępem do eksportów modułu jako `m`
        // eslint-disable-next-line no-new-func
        let got = new Function('m', `"use strict"; return (${t.expr});`)(mod.exports);
        if (got && typeof got.then === 'function') got = await got;
        results.push({ name, pass: deepEqual(got, t.expected), expected: fmt(t.expected, 1), got: fmt(got, 1), hidden: t.hidden });
      }
    } catch (err) {
      results.push({ name, pass: false, expected: t.output !== undefined ? String(t.output) : fmt(t.expected, 1), got: null, error: describeError(err), hidden: t.hidden });
    }
  }
  return { logs, topError, results };
}

self.onmessage = async (e) => {
  if (e.data.mode === 'node') {
    self.postMessage(await runNodeTests(e.data));
    return;
  }
  return runPlain(e);
};

function runPlain(e) {
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
}
