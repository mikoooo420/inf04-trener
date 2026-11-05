// =========================================================
// MARKDOWN – renderowanie teorii
//  marked (parser) → DOMPurify (sanityzacja) → callouty CKE → kolorowanie kodu → spis treści
//
//  Własna składnia calloutów (jak w GitHubie):
//    > [!CKE] Tip egzaminacyjny
//    > [!PULAPKA] Typowy błąd
//    > [!WZOR] Do zapamiętania
//    > [!INFO] Ciekawostka
// =========================================================

import { LIBS } from '../config.js';
import { loadScript } from '../core/loader.js';
import { iconHTML } from '../core/icons.js';

const CALLOUTS = {
  CKE: { cls: 'cke', title: 'Tip egzaminacyjny CKE', icon: 'star' },
  PULAPKA: { cls: 'trap', title: 'Pułapka', icon: 'alert' },
  'PUŁAPKA': { cls: 'trap', title: 'Pułapka', icon: 'alert' },
  WZOR: { cls: 'formula', title: 'Do zapamiętania', icon: 'formula' },
  'WZÓR': { cls: 'formula', title: 'Do zapamiętania', icon: 'formula' },
  INFO: { cls: 'info', title: 'Warto wiedzieć', icon: 'info' },
};

export async function ensureMarkdownLibs() {
  await Promise.all([loadScript(LIBS.marked), loadScript(LIBS.purify)]);
}

export async function ensureHighlighter() {
  try {
    await loadScript(LIBS.hljs);
    return window.hljs || null;
  } catch {
    return null;
  }
}

export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

/** Usuwa blok front-matter (--- ... ---) i zwraca { meta, body }. */
export function parseFrontMatter(md) {
  const m = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!m) return { meta: {}, body: md };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, body: md.slice(m[0].length) };
}

/**
 * Renderuje Markdown do elementu.
 * @returns {{ el: HTMLElement, headings: {id, text, level}[] }}
 */
export async function renderMarkdown(md) {
  await ensureMarkdownLibs();
  const html = window.marked.parse(md, { gfm: true, breaks: false });
  const clean = window.DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });

  const el = document.createElement('div');
  el.className = 'prose';
  el.innerHTML = clean;

  // Callouty
  for (const bq of el.querySelectorAll('blockquote')) {
    const first = bq.querySelector('p');
    if (!first) continue;
    // [!TYP] Opcjonalny tytuł w tej samej linii, treść w kolejnych liniach
    const m = first.innerHTML.match(/^\s*\[!([A-ZĄĆĘŁŃÓŚŹŻ]+)\][ \t]*([^\n]*?)[ \t]*(?:\n|<br\s*\/?>\s*|$)([\s\S]*)$/);
    if (!m || !CALLOUTS[m[1]]) continue;
    const def = CALLOUTS[m[1]];
    const customTitle = m[2].trim();
    const body = m[3].trim();
    const aside = document.createElement('aside');
    aside.className = `callout callout--${def.cls}`;
    aside.innerHTML = `<div class="callout__title">${iconHTML(def.icon)}<span>${customTitle || def.title}</span></div>`;
    if (body) {
      const p = document.createElement('p');
      p.innerHTML = body;
      aside.append(p);
    }
    first.remove();
    aside.append(...bq.childNodes);
    bq.replaceWith(aside);
  }

  // Nagłówki: identyfikatory + kotwice
  const headings = [];
  const used = new Set();
  for (const hEl of el.querySelectorAll('h2, h3')) {
    let id = slugify(hEl.textContent) || 'sekcja';
    while (used.has(id)) id += '-x';
    used.add(id);
    hEl.id = id;
    headings.push({ id, text: hEl.textContent, level: Number(hEl.tagName[1]) });
    const a = document.createElement('a');
    a.href = location.hash || '#/';
    a.className = 'anchor';
    a.setAttribute('aria-hidden', 'true');
    a.textContent = '#';
    a.addEventListener('click', (e) => {
      e.preventDefault();
      hEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    hEl.append(a);
  }

  // Tabele w kontenerze z przewijaniem
  for (const table of el.querySelectorAll('table')) {
    const wrap = document.createElement('div');
    wrap.className = 'table-scroll';
    table.replaceWith(wrap);
    wrap.append(table);
  }

  // Linki zewnętrzne w nowej karcie
  for (const a of el.querySelectorAll('a[href^="http"]')) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }

  await highlightWithin(el);
  return { el, headings };
}

/** Koloruje wszystkie <pre><code> wewnątrz elementu (jeśli highlight.js jest dostępny). */
export async function highlightWithin(root) {
  const blocks = root.querySelectorAll('pre code');
  if (!blocks.length) return;
  const hljs = await ensureHighlighter();
  if (!hljs) return;
  for (const block of blocks) {
    const lang = [...block.classList].find((c) => c.startsWith('language-'))?.slice(9);
    const map = { js: 'javascript', 'c++': 'cpp', cs: 'csharp', 'c#': 'csharp', py: 'python', html: 'xml' };
    const normalized = map[lang] || lang;
    if (normalized && hljs.getLanguage(normalized)) {
      block.innerHTML = hljs.highlight(block.textContent, { language: normalized }).value;
      block.classList.add('hljs');
    }
    const label = { cpp: 'C++', csharp: 'C#', java: 'Java', python: 'Python', javascript: 'JavaScript', sql: 'SQL', xml: 'HTML', css: 'CSS', bash: 'Terminal', json: 'JSON' }[normalized];
    if (label && block.parentElement) block.parentElement.dataset.lang = label;
  }
}

/** Zwraca HTML z pokolorowanym kodem (lub escapowany tekst). */
export async function highlightCode(code, lang) {
  const hljs = await ensureHighlighter();
  const map = { js: 'javascript', html: 'xml' };
  const l = map[lang] || lang;
  if (hljs && l && hljs.getLanguage(l)) return hljs.highlight(code, { language: l }).value;
  return code.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}
