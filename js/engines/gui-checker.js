// =========================================================
// GUI CHECKER – statyczne sprawdzanie projektów GUI
//  (XAML, Android XML, FXML, szablony Angulara + kod obsługi)
//
//  Aplikacji desktopowej czy mobilnej nie uruchomimy w przeglądarce,
//  ale możemy sprawdzić to, za co egzaminator daje punkty:
//  nazwy kontrolek, ich typy, właściwości, podpięte zdarzenia,
//  istnienie metod obsługi i kluczowe fragmenty logiki.
//
//  Rodzaje testów (pole `type`):
//    wellformed – plik XML jest poprawny składniowo
//    element    – istnieje element o danym znaczniku i atrybutach
//    count      – liczba elementów ≥ min
//    handler    – zdarzenie z layoutu ma metodę w kodzie
//    code       – kod pasuje do wyrażenia regularnego
//    notcode    – kod NIE zawiera wzorca
// =========================================================

const xmlCache = new Map();

function stripXmlComments(s) {
  return s.replace(/<!--[\s\S]*?-->/g, '');
}

/** Usuwa komentarze z kodu (C#, Java, Kotlin, JS/TS) – żeby nie zaliczać zakomentowanego kodu. */
export function stripCodeComments(src) {
  let out = '';
  let i = 0;
  let str = null;
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (str) {
      out += c;
      if (c === '\\') { out += n || ''; i += 2; continue; }
      if (c === str) str = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { str = c; out += c; i++; continue; }
    if (c === '/' && n === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && n === '*') { const end = src.indexOf('*/', i + 2); i = end === -1 ? src.length : end + 2; continue; }
    out += c;
    i++;
  }
  return out;
}

function parseXml(src, mode = 'xml') {
  const key = mode + '\u0000' + src;
  if (xmlCache.has(key)) return xmlCache.get(key);
  let result;
  if (mode === 'html') {
    const doc = new DOMParser().parseFromString(`<template>${src}</template>`, 'text/html');
    result = { doc: doc.querySelector('template').content, error: null, html: true };
  } else {
    const doc = new DOMParser().parseFromString(src.trim(), 'application/xml');
    const err = doc.getElementsByTagName('parsererror')[0];
    result = { doc, error: err ? err.textContent.split('\n').filter(Boolean).slice(0, 2).join(' ') : null, html: false };
  }
  if (xmlCache.size > 50) xmlCache.clear();
  xmlCache.set(key, result);
  return result;
}

function allElements(parsed) {
  return [...parsed.doc.querySelectorAll('*')];
}

function localName(el) {
  return (el.localName || el.tagName).split(':').pop();
}

function tagMatches(el, spec, html) {
  if (!spec || spec === '*') return true;
  const names = [el.tagName, localName(el)];
  const alts = spec.split('|');
  return alts.some((a) => {
    if (a.startsWith('re:')) return names.some((n) => new RegExp(a.slice(3)).test(n));
    return names.some((n) => (html ? n.toLowerCase() === a.toLowerCase() : n === a));
  });
}

function getAttr(el, name, html) {
  if (!html) {
    if (el.hasAttribute(name)) return el.getAttribute(name);
    // Pozwól pominąć prefiks (np. Name zamiast x:Name)
    for (const a of el.attributes) if (a.localName === name.split(':').pop() && name.includes(':')) return a.value;
    return null;
  }
  const lower = name.toLowerCase();
  for (const a of el.attributes) if (a.name.toLowerCase() === lower) return a.value;
  return null;
}

function valueMatches(actual, expected) {
  if (actual == null) return false;
  if (expected === '*') return actual.trim() !== '';
  if (typeof expected === 'string' && expected.startsWith('re:')) return new RegExp(expected.slice(3), 'i').test(actual);
  return actual.trim() === String(expected);
}

function findElements(parsed, tag, attrs = {}) {
  return allElements(parsed).filter((el) =>
    tagMatches(el, tag, parsed.html) &&
    Object.entries(attrs).every(([k, v]) => valueMatches(getAttr(el, k, parsed.html), v))
  );
}

function describeSelector(tag, attrs) {
  const a = Object.entries(attrs || {}).map(([k, v]) => `${k}="${v === '*' ? '…' : String(v).replace(/^re:/, '~')}"`).join(' ');
  return `<${(tag || '*').split('|')[0]}${a ? ' ' + a : ''}>`;
}

/**
 * @param {object[]} checks lista testów
 * @param {Record<string,string>} files zawartość plików
 * @param {object} fileModes np. { 'app.component.html': 'html' }
 * @returns {{name, pass, error, points}[]}
 */
export function runStaticChecks(checks, files, fileModes = {}) {
  return checks.map((c) => {
    const points = c.points ?? 1;
    try {
      const src = files[c.file];
      if (src == null) return { name: c.name, pass: false, error: `Brak pliku ${c.file}`, points };
      const mode = fileModes[c.file] || 'xml';

      switch (c.type) {
        case 'wellformed': {
          const p = parseXml(stripXmlComments(src), mode);
          return { name: c.name, pass: !p.error, error: p.error ? `Błąd składni XML: ${p.error}` : null, points };
        }
        case 'element': {
          const p = parseXml(src, mode);
          if (p.error) return { name: c.name, pass: false, error: 'Plik layoutu zawiera błąd składni – popraw go najpierw.', points };
          const found = findElements(p, c.tag, c.attrs);
          let ok = found.length > 0;
          if (ok && c.text) ok = found.some((el) => valueMatches(el.textContent, c.text));
          return { name: c.name, pass: ok, error: ok ? null : c.hint || `Nie znaleziono elementu ${describeSelector(c.tag, c.attrs)}${c.text ? ` z tekstem „${String(c.text).replace(/^re:/, '')}”` : ''}`, points };
        }
        case 'count': {
          const p = parseXml(src, mode);
          if (p.error) return { name: c.name, pass: false, error: 'Plik layoutu zawiera błąd składni.', points };
          let scope = [p.doc];
          if (c.within) scope = findElements(p, c.within.tag, c.within.attrs);
          const n = scope.reduce((acc, root) => acc + [...root.querySelectorAll('*')].filter((el) => tagMatches(el, c.tag, p.html)).length, 0);
          const ok = n >= (c.min ?? 1);
          return { name: c.name, pass: ok, error: ok ? null : c.hint || `Oczekiwano co najmniej ${c.min} elementów <${c.tag.split('|')[0]}>, jest ${n}`, points };
        }
        case 'handler': {
          const p = parseXml(src, mode);
          if (p.error) return { name: c.name, pass: false, error: 'Plik layoutu zawiera błąd składni.', points };
          const el = findElements(p, c.tag, c.attrs)[0];
          if (!el) return { name: c.name, pass: false, error: `Nie znaleziono elementu ${describeSelector(c.tag, c.attrs)}`, points };
          let handlerName = getAttr(el, c.event, p.html);
          if (!handlerName) return { name: c.name, pass: false, error: c.hint || `Element nie ma podpiętego zdarzenia ${c.event}="…"`, points };
          handlerName = handlerName.replace(/^#/, '').replace(/\(.*$/, '').trim();
          const code = stripCodeComments(files[c.codeFile] || '');
          const ok = new RegExp(`\\b${handlerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(`).test(code);
          return { name: c.name, pass: ok, error: ok ? null : `Zdarzenie wskazuje metodę „${handlerName}”, ale nie ma jej w pliku ${c.codeFile}`, points };
        }
        case 'handlerRegex': {
          // np. btnKlik.Click += btnKlik_Click;  → metoda btnKlik_Click musi istnieć w codeFile
          const m = stripCodeComments(src).match(new RegExp(c.match, c.flags ?? 'm'));
          if (!m) return { name: c.name, pass: false, error: c.hint || 'Nie znaleziono podpięcia zdarzenia.', points };
          const handlerName = m[1];
          if (!handlerName || /^\(/.test(handlerName)) return { name: c.name, pass: true, error: null, points }; // lambda
          const code = stripCodeComments(files[c.codeFile] || '');
          const ok = new RegExp(`\\b${handlerName}\\s*\\(`).test(code);
          return { name: c.name, pass: ok, error: ok ? null : `Zdarzenie wskazuje metodę „${handlerName}”, ale nie ma jej w pliku ${c.codeFile}`, points };
        }
        case 'code':
        case 'notcode': {
          const body = c.keepComments ? src : (mode === 'xml' || mode === 'html' ? stripXmlComments(src) : stripCodeComments(src));
          const found = new RegExp(c.match, c.flags ?? 'm').test(body);
          const ok = c.type === 'code' ? found : !found;
          return { name: c.name, pass: ok, error: ok ? null : c.hint || (c.type === 'code' ? 'W kodzie brakuje wymaganego fragmentu.' : 'Kod zawiera niedozwolony fragment.'), points };
        }
        default:
          return { name: c.name, pass: false, error: `Nieznany typ testu: ${c.type}`, points };
      }
    } catch (err) {
      return { name: c.name, pass: false, error: 'Błąd testu: ' + err.message, points };
    }
  });
}
