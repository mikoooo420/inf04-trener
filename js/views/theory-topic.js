// Pojedynczy dział teorii: treść Markdown + spis treści + mini-test
import { h, setChildren, append } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { fetchText, getManifest, getQuestionsByTopic } from '../core/loader.js';
import { renderMarkdown, parseFrontMatter } from '../utils/markdown.js';
import { prepareQuestion, renderQuestionCard } from '../components/question-card.js';
import { saveAnswer } from '../engines/quiz-engine.js';
import { sample } from '../utils/random.js';
import { toast } from '../components/toast.js';

export default async function theoryTopic(root, { id }) {
  const manifest = await getManifest();
  const idx = manifest.topics.findIndex((t) => t.id === id);
  if (idx === -1) {
    append(root, h('div.empty', h('h2', 'Nie ma takiego działu'), h('a.btn', { href: '#/teoria' }, 'Lista działów')));
    return;
  }
  const topic = manifest.topics[idx];
  const prev = manifest.topics[idx - 1];
  const next = manifest.topics[idx + 1];
  document.title = `${topic.title} · INF.04 Trener`;

  const raw = await fetchText(`./data/theory/${id}.md`);
  const { body } = parseFrontMatter(raw);
  const { el: article, headings } = await renderMarkdown(body);

  const state = store.get();
  const doneBtn = h('button.btn', { type: 'button' });
  function paintDone() {
    const done = !!store.get().theory[id]?.readAt;
    doneBtn.className = `btn ${done ? 'btn--success' : 'btn--primary'}`;
    setChildren(doneBtn, icon('check'), done ? 'Przerobione' : 'Oznacz jako przerobione');
  }
  doneBtn.addEventListener('click', () => {
    const wasDone = !!store.get().theory[id]?.readAt;
    store.update((s) => {
      s.theory[id] ||= {};
      if (wasDone) delete s.theory[id].readAt;
      else s.theory[id].readAt = new Date().toISOString();
    }, { scope: 'theory' });
    paintDone();
    if (!wasDone) toast('Dział oznaczony jako przerobiony.', 'success');
  });
  paintDone();

  // Spis treści
  const toc = headings.length
    ? h('nav.toc', { 'aria-label': 'Spis treści' },
        h('div.toc__title', 'W tym dziale'),
        h('ol', headings.filter((x) => x.level === 2).map((x) =>
          h('li', h('a', {
            href: location.hash,
            onclick: (e) => { e.preventDefault(); document.getElementById(x.id)?.scrollIntoView({ behavior: 'smooth' }); },
          }, x.text.replace(/#$/, '')))
        ))
      )
    : null;

  // Mini-test
  const questions = await getQuestionsByTopic(id);
  const miniSection = h('section.mini-quiz');
  if (questions.length) {
    const set = sample(questions, Math.min(4, questions.length)).map((q) => prepareQuestion(q));
    let answered = 0;
    let correctCount = 0;
    const summary = h('div.mini-quiz__summary');
    miniSection.append(
      h('div.section__title', h('h2', 'Mini-test'), h('span.muted.small', `${set.length} losowe pytania z działu`))
    );
    for (const [i, inst] of set.entries()) {
      miniSection.append(await renderQuestionCard(inst, {
        mode: 'learn',
        index: i,
        total: set.length,
        onAnswer: (correct) => {
          saveAnswer(inst.q.id, correct);
          answered++;
          if (correct) correctCount++;
          if (answered === set.length) {
            const ratio = correctCount / set.length;
            store.update((s) => {
              s.theory[id] ||= {};
              s.theory[id].miniQuiz = Math.max(s.theory[id].miniQuiz || 0, ratio);
              if (ratio >= 0.75 && !s.theory[id].readAt) s.theory[id].readAt = new Date().toISOString();
            }, { scope: 'theory' });
            paintDone();
            setChildren(summary, 
              h(`div.card.mini-quiz__result.${ratio >= 0.75 ? 'is-good' : 'is-bad'}`,
                h('strong', `Wynik: ${correctCount}/${set.length}`),
                h('span', ratio >= 0.75 ? ' – świetnie, dział zaliczony!' : ' – warto wrócić do teorii i spróbować quizu z tego działu.'),
                h('div.btn-row', { style: 'margin-top:.75rem' },
                  h('a.btn.btn--primary', { href: `#/quiz/${id}` }, icon('quiz'), 'Pełny quiz z działu'),
                  next ? h('a.btn', { href: `#/teoria/${next.id}` }, 'Następny dział', icon('arrowRight')) : null
                )
              )
            );
          }
        },
      }));
    }
    miniSection.append(summary);
  }

  append(root, 
    h('nav.breadcrumbs', { 'aria-label': 'Okruszki' },
      h('a', { href: '#/teoria' }, 'Teoria'), h('span', { 'aria-hidden': 'true' }, '/'), h('span', topic.title)
    ),
    h('div.theory-layout',
      h('div.theory-main',
        h('header.theory-head',
          h('div.page-head__eyebrow', `Dział ${idx + 1} z ${manifest.topics.length}`),
          h('h1', topic.title),
          h('p.muted', topic.description),
          h('div.theory-head__meta',
            h('span', icon('clock'), ` ${topic.minutes} min czytania`),
            h('span', icon('exam'), ` ok. ${topic.examWeight} z 40 pytań na egzaminie`),
            state.theory[id]?.miniQuiz != null ? h('span', icon('target'), ` mini-test: ${Math.round(state.theory[id].miniQuiz * 100)}%`) : null
          )
        ),
        article,
        h('div.theory-done', doneBtn, h('a.btn', { href: `#/quiz/${id}` }, icon('quiz'), 'Quiz z działu')),
        miniSection,
        h('nav.pager', { 'aria-label': 'Nawigacja między działami' },
          prev ? h('a.pager__link', { href: `#/teoria/${prev.id}` }, h('span.small.faint', '← Poprzedni'), h('strong', prev.title)) : h('span'),
          next ? h('a.pager__link.pager__link--next', { href: `#/teoria/${next.id}` }, h('span.small.faint', 'Następny →'), h('strong', next.title)) : h('span')
        )
      ),
      toc ? h('aside.theory-aside', toc) : null
    )
  );
}
