// =========================================================
// QUESTION CARD – wspólny komponent pytania (quiz, egzamin, powtórki, mini-test)
//  mode 'learn' – natychmiastowa informacja zwrotna + wyjaśnienie
//  mode 'exam'  – tylko zaznaczanie (można zmienić odpowiedź), bez podpowiedzi
// =========================================================

import { h, setChildren } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { shuffle } from '../utils/random.js';
import { highlightCode } from '../utils/markdown.js';
import { LANG_LABELS } from '../config.js';
import { difficulty } from './progress.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/** Przygotowuje instancję pytania z przetasowanymi odpowiedziami. */
export function prepareQuestion(q, { shuffleAnswers = true } = {}) {
  const order = q.answers.map((_, i) => i);
  const shuffled = shuffleAnswers && !q.fixedOrder ? shuffle(order) : order;
  return { q, order: shuffled, selected: null };
}

/** Wybiera wariant kodu (q.code może być obiektem lub tablicą wariantów w różnych językach). */
function codeVariants(code) {
  if (!code) return [];
  return Array.isArray(code) ? code : [code];
}

async function renderCodeBlock(code) {
  const variants = codeVariants(code);
  if (!variants.length) return null;
  const pref = store.get().settings.codeLang;
  let active = variants.find((v) => v.lang === pref) || variants[0];

  const pre = h('pre.q-code');
  const codeEl = h('code.hljs');
  pre.append(codeEl);

  async function paint() {
    codeEl.innerHTML = await highlightCode(active.src, active.lang);
    pre.dataset.lang = LANG_LABELS[active.lang] || active.lang;
  }
  await paint();

  if (variants.length === 1) return pre;

  const tabs = h('div.tabs.tabs--code', { role: 'tablist', 'aria-label': 'Język kodu' },
    variants.map((v) =>
      h('button', {
        type: 'button',
        role: 'tab',
        'aria-selected': String(v === active),
        onclick: async (e) => {
          active = v;
          tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b === e.currentTarget)));
          await paint();
        },
      }, LANG_LABELS[v.lang] || v.lang)
    )
  );
  return h('div.q-code-wrap', tabs, pre);
}

/**
 * Renderuje kartę pytania.
 * @param {object} inst  wynik prepareQuestion
 * @param {object} opts  { mode, index, total, topicTitle, onAnswer(correct, displayIdx), onSelect(origIdx) }
 */
export async function renderQuestionCard(inst, opts = {}) {
  const { q } = inst;
  const mode = opts.mode || 'learn';
  let locked = mode === 'learn' && inst.selected != null;

  const answersEl = h('div.answers', { role: 'radiogroup', 'aria-label': 'Odpowiedzi' });
  const feedback = h('div.q-feedback');

  const buttons = inst.order.map((origIdx, displayIdx) => {
    const btn = h('button.answer', {
      type: 'button',
      role: 'radio',
      'aria-checked': String(inst.selected === origIdx),
      dataset: { idx: String(origIdx) },
      onclick: () => choose(origIdx),
    },
      h('span.answer__letter', LETTERS[displayIdx]),
      h('span.answer__text', q.answers[origIdx])
    );
    return btn;
  });
  answersEl.append(...buttons);

  function paintState() {
    buttons.forEach((btn) => {
      const idx = Number(btn.dataset.idx);
      btn.setAttribute('aria-checked', String(inst.selected === idx));
      btn.classList.toggle('is-selected', inst.selected === idx);
      if (mode === 'learn' && inst.selected != null) {
        btn.disabled = true;
        btn.classList.toggle('is-correct', idx === q.correct);
        btn.classList.toggle('is-wrong', idx === inst.selected && idx !== q.correct);
      }
    });
  }

  function showFeedback() {
    const correct = inst.selected === q.correct;
    setChildren(feedback, 
      h(`div.q-verdict.${correct ? 'is-correct' : 'is-wrong'}`,
        icon(correct ? 'check' : 'x'),
        h('strong', correct ? 'Dobrze!' : 'Niestety nie.'),
        correct ? null : h('span', ` Poprawna odpowiedź: ${LETTERS[inst.order.indexOf(q.correct)]}`)
      ),
      q.explanation ? h('p.q-explanation', q.explanation) : null,
      q.tip ? h('aside.callout.callout--cke',
        h('div.callout__title', icon('star'), h('span', 'Tip CKE')),
        h('p', q.tip)) : null,
      (q.theory || q.topic) ? h('p.small', h('a', { href: `#/teoria/${q.theory || q.topic}` }, 'Powtórz teorię z tego działu →')) : null
    );
  }

  function choose(origIdx) {
    if (locked) return;
    inst.selected = origIdx;
    paintState();
    if (mode === 'learn') {
      locked = true;
      showFeedback();
      opts.onAnswer?.(origIdx === q.correct, origIdx);
    } else {
      opts.onSelect?.(origIdx);
    }
  }

  const codeBlock = await renderCodeBlock(q.code);

  const card = h('article.q-card', { 'aria-labelledby': `q-${q.id}` },
    h('header.q-head',
      opts.total ? h('span.q-num', `Pytanie ${opts.index + 1} z ${opts.total}`) : null,
      opts.topicTitle ? h('span.badge', opts.topicTitle) : null,
      q.difficulty ? difficulty(q.difficulty) : null
    ),
    h(`h2.q-text#q-${q.id}`, q.question),
    codeBlock,
    answersEl,
    feedback
  );

  paintState();
  if (mode === 'learn' && inst.selected != null) showFeedback();

  // API dla widoku (skróty klawiszowe)
  card.chooseByDisplayIndex = (displayIdx) => {
    const origIdx = inst.order[displayIdx];
    if (origIdx != null) choose(origIdx);
  };
  return card;
}

/** Obsługa klawiszy 1–4 / A–D dla aktywnej karty. Zwraca funkcję odpinającą. */
export function bindAnswerKeys(getCard, { onEnter, onPrev, onNext } = {}) {
  const handler = (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (['input', 'textarea', 'select'].includes(tag) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.querySelector('dialog[open]')) return;
    const card = getCard();
    if (!card) return;
    const k = e.key.toLowerCase();
    const map = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 };
    if (k in map) {
      e.preventDefault();
      card.chooseByDisplayIndex(map[k]);
    } else if (k === 'enter' && onEnter && !(e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement)) {
      e.preventDefault();
      onEnter();
    } else if (k === 'arrowright' && onNext) {
      onNext();
    } else if (k === 'arrowleft' && onPrev) {
      onPrev();
    }
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}
