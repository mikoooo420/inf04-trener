// =========================================================
// CODE EDITOR – lekki edytor kodu bez zależności
//  • kolorowanie składni (warstwa <pre> pod przezroczystym <textarea>)
//  • numery linii, Tab/Shift+Tab, automatyczne wcięcia, Ctrl+Enter = uruchom
//  • Esc, a potem Tab – wyjście z edytora klawiaturą (dostępność)
// =========================================================

import { h, setChildren } from '../core/dom.js';
import { ensureHighlighter } from '../utils/markdown.js';

const INDENT = '    ';
const LANG_MAP = { js: 'javascript', html: 'xml' };

export function createEditor({ value = '', lang = 'javascript', onRun, onChange, label = 'Edytor kodu', minLines = 8, maxHeight } = {}) {
  const hlLang = LANG_MAP[lang] || lang;
  let hljs = null;
  let escapePressed = false;

  const gutter = h('div.editor__gutter', { 'aria-hidden': 'true' });
  const code = h('code');
  const pre = h('pre.editor__highlight', { 'aria-hidden': 'true' }, code);
  const textarea = h('textarea.editor__input', {
    spellcheck: false,
    autocapitalize: 'off',
    autocomplete: 'off',
    'aria-label': `${label}. Ctrl+Enter uruchamia. Esc, a potem Tab – wyjście z edytora.`,
    wrap: 'off',
  });
  textarea.value = value;

  const el = h('div.editor', { style: maxHeight ? `max-height:${maxHeight}` : null },
    h('div.editor__inner', gutter, h('div.editor__area', pre, textarea))
  );

  function escape(s) {
    return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  }

  function paint() {
    const text = textarea.value;
    const lines = Math.max(text.split('\n').length, minLines);
    // Spacja na końcu – żeby ostatnia pusta linia miała wysokość
    const src = text + '\n ';
    code.innerHTML = hljs && hljs.getLanguage(hlLang) ? hljs.highlight(src, { language: hlLang }).value : escape(src);
    if (gutter.childElementCount !== lines) {
      setChildren(gutter, ...Array.from({ length: lines }, (_, i) => h('span', String(i + 1))));
    }
    pre.style.minHeight = `calc(${lines} * 1.55em + 2rem)`;
  }

  ensureHighlighter().then((lib) => { hljs = lib; paint(); });

  function replaceSelection(text, selectStartOffset = text.length, selectEndOffset = selectStartOffset) {
    const { selectionStart: s, selectionEnd: e } = textarea;
    textarea.setRangeText(text, s, e, 'end');
    textarea.selectionStart = s + selectStartOffset;
    textarea.selectionEnd = s + selectEndOffset;
    textarea.dispatchEvent(new Event('input'));
  }

  function lineStartOf(pos) {
    return textarea.value.lastIndexOf('\n', pos - 1) + 1;
  }

  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { escapePressed = true; return; }

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun?.();
      return;
    }

    if (e.key === 'Tab') {
      if (escapePressed) { escapePressed = false; return; } // pozwól wyjść z pola
      e.preventDefault();
      const { selectionStart: s, selectionEnd: end, value: v } = textarea;
      const multi = v.slice(s, end).includes('\n');
      if (!multi && !e.shiftKey) {
        replaceSelection(INDENT);
        return;
      }
      // Wcięcie / cofnięcie wcięcia wielu linii
      const ls = lineStartOf(s);
      const block = v.slice(ls, end);
      const lines = block.split('\n');
      const changed = e.shiftKey
        ? lines.map((l) => l.replace(new RegExp(`^( {1,${INDENT.length}}|\\t)`), ''))
        : lines.map((l) => INDENT + l);
      const out = changed.join('\n');
      textarea.setRangeText(out, ls, end, 'preserve');
      textarea.selectionStart = multi || !e.shiftKey ? ls : Math.max(ls, s - (block.length - out.length));
      textarea.selectionEnd = ls + out.length;
      textarea.dispatchEvent(new Event('input'));
      return;
    }
    escapePressed = false;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const { selectionStart: s, value: v } = textarea;
      const ls = lineStartOf(s);
      const line = v.slice(ls, s);
      const indent = (line.match(/^[ \t]*/) || [''])[0];
      const trimmed = line.trimEnd();
      const opens = /[{[(]$/.test(trimmed) || (hlLang === 'python' && trimmed.endsWith(':'));
      const nextChar = v[textarea.selectionEnd];
      if (opens && /[}\])]/.test(nextChar || '')) {
        // {|} → nowa linia z wcięciem i zamknięciem pod spodem
        const ins = '\n' + indent + INDENT + '\n' + indent;
        replaceSelection(ins, 1 + indent.length + INDENT.length);
      } else {
        replaceSelection('\n' + indent + (opens ? INDENT : ''));
      }
      return;
    }

    // Domykanie nawiasów i cudzysłowów
    const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
    if (pairs[e.key] && textarea.selectionStart === textarea.selectionEnd) {
      const next = textarea.value[textarea.selectionStart] || '';
      if ((e.key === '"' || e.key === "'") && next === e.key) {
        e.preventDefault();
        textarea.selectionStart = textarea.selectionEnd = textarea.selectionStart + 1;
        return;
      }
      if (!next || /[\s)\]};,]/.test(next)) {
        e.preventDefault();
        replaceSelection(e.key + pairs[e.key], 1);
        return;
      }
    }
    if ([')', ']', '}'].includes(e.key) && textarea.value[textarea.selectionStart] === e.key && textarea.selectionStart === textarea.selectionEnd) {
      e.preventDefault();
      textarea.selectionStart = textarea.selectionEnd = textarea.selectionStart + 1;
      return;
    }
    if (e.key === 'Backspace' && textarea.selectionStart === textarea.selectionEnd) {
      const s = textarea.selectionStart;
      const prev = textarea.value[s - 1];
      const next = textarea.value[s];
      if (prev && pairs[prev] === next) {
        e.preventDefault();
        textarea.setRangeText('', s - 1, s + 1, 'end');
        textarea.dispatchEvent(new Event('input'));
      }
    }
  });

  textarea.addEventListener('input', () => {
    paint();
    onChange?.(textarea.value);
  });

  paint();

  return {
    el,
    textarea,
    getValue: () => textarea.value,
    setValue(v) {
      textarea.value = v;
      paint();
      onChange?.(v);
    },
    focus: () => textarea.focus(),
  };
}
