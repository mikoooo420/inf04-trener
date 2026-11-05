// =========================================================
// ROUTER – routing oparty na hashu (#/teoria/oop)
//  • działa na GitHub Pages bez konfiguracji serwera (odświeżenie ≠ 404)
//  • widoki ładowane leniwie przez dynamiczny import()
//  • "strażnik wyjścia" – np. pytanie przed opuszczeniem trwającego egzaminu
// =========================================================

import { clear, h } from './dom.js';

const routes = [];
let current = { cleanup: null, path: null };
let leaveGuard = null;
let ignoreNext = false;
let lastHash = '';
let renderToken = 0;

/**
 * Rejestruje trasę.
 * @param {string} pattern np. 'teoria/:id'
 * @param {() => Promise<{default: Function}>} loader dynamiczny import widoku
 * @param {object} meta { title, nav } – nav = klucz podświetlanej pozycji menu
 */
export function route(pattern, loader, meta = {}) {
  const keys = [];
  const regex = new RegExp(
    '^' +
      pattern
        .split('/')
        .filter(Boolean)
        .map((part) => {
          if (part.startsWith(':')) {
            keys.push(part.slice(1));
            return '/([^/]+)';
          }
          return '/' + part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        })
        .join('') +
      '/?$'
  );
  routes.push({ pattern, regex, keys, loader, meta });
}

export function currentPath() {
  const hash = location.hash.replace(/^#/, '') || '/';
  return hash.startsWith('/') ? hash : '/' + hash;
}

export function navigate(path, { replace = false } = {}) {
  const target = '#' + (path.startsWith('/') ? path : '/' + path);
  if (replace) {
    history.replaceState(null, '', target);
    handle();
  } else if (location.hash === target) {
    handle();
  } else {
    location.hash = target;
  }
}

/** fn() → true/false lub Promise<boolean>. null usuwa strażnika. */
export function setLeaveGuard(fn) {
  leaveGuard = fn;
}

function match(path) {
  const clean = path.split('?')[0];
  for (const r of routes) {
    const m = clean === '/' && r.pattern === '' ? [] : clean.match(r.regex);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      return { route: r, params };
    }
  }
  return null;
}

let onNavigateCb = () => {};
export function onNavigate(fn) { onNavigateCb = fn; }

async function handle() {
  if (ignoreNext) { ignoreNext = false; return; }

  const path = currentPath();

  if (leaveGuard && path !== current.path) {
    const ok = await leaveGuard();
    if (!ok) {
      ignoreNext = true;
      history.replaceState(null, '', lastHash || '#/');
      ignoreNext = false;
      return;
    }
    leaveGuard = null;
  }

  lastHash = location.hash || '#/';
  const container = document.getElementById('view');
  const found = match(path);
  const token = ++renderToken;

  if (typeof current.cleanup === 'function') {
    try { current.cleanup(); } catch (err) { console.error(err); }
  }
  current = { cleanup: null, path };

  clear(container);
  container.append(h('div.loading', h('span.spinner'), ' Ładowanie…'));

  try {
    const routeDef = found ? found.route : routes.find((r) => r.pattern === '*');
    const mod = await routeDef.loader();
    if (token !== renderToken) return; // użytkownik zdążył przejść dalej

    const fresh = h('div');
    const cleanup = await mod.default(fresh, found ? found.params : {}, { path });
    if (token !== renderToken) {
      if (typeof cleanup === 'function') cleanup();
      return;
    }

    clear(container);
    container.append(...fresh.childNodes);
    // restart animacji wejścia
    container.style.animation = 'none';
    void container.offsetWidth;
    container.style.animation = '';
    current.cleanup = cleanup;

    const title = routeDef.meta.title;
    document.title = (typeof title === 'function' ? title(found?.params || {}) : title)
      ? `${typeof title === 'function' ? title(found?.params || {}) : title} · INF.04 Trener`
      : 'INF.04 Trener – nauka do egzaminu zawodowego';

    onNavigateCb({ path, meta: routeDef.meta, params: found?.params || {} });
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    document.getElementById('main')?.focus({ preventScroll: true });
  } catch (err) {
    console.error(err);
    if (token !== renderToken) return;
    clear(container);
    container.append(
      h('div.empty',
        h('h2', 'Coś poszło nie tak'),
        h('p', err.message || String(err)),
        h('p.small.faint', 'Jeśli otwierasz plik bezpośrednio z dysku (file://), uruchom lokalny serwer – patrz README.'),
        h('a.btn.btn--primary', { href: '#/' }, 'Wróć na start')
      )
    );
  }
}

export function startRouter() {
  window.addEventListener('hashchange', handle);
  handle();
}
