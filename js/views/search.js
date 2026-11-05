// Wyszukiwarka – przeszukuje teorię i pytania (bez serwera)
import { h, append } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { fetchText, getManifest, getAllQuestions } from '../core/loader.js';
import { parseFrontMatter, slugify } from '../utils/markdown.js';

const fold = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');

function stripMd(s) {
  return s
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[!([A-ZĄĆĘŁŃÓŚŹŻ]+)\]/g, '')
    .replace(/[*_>#|]/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function snippet(text, q) {
  const i = fold(text).indexOf(fold(q));
  if (i < 0) return text.slice(0, 160);
  const start = Math.max(0, i - 70);
  const end = Math.min(text.length, i + q.length + 90);
  const before = (start > 0 ? '…' : '') + text.slice(start, i);
  const hit = text.slice(i, i + q.length);
  const after = text.slice(i + q.length, end) + (end < text.length ? '…' : '');
  return [before, h('mark', hit), after];
}

export default async function search(root, { q = '' }) {
  const query = q.trim();
  const input = document.getElementById('search-input');
  if (input && input.value !== query) input.value = query;

  append(root, h('header.page-head', h('div.page-head__eyebrow', 'Wyszukiwarka'), h('h1', query ? `Wyniki dla „${query}”` : 'Szukaj')));

  if (query.length < 2) {
    append(root, h('p.muted', 'Wpisz co najmniej 2 znaki w polu wyszukiwania u góry (skrót: /).'));
    return;
  }

  const manifest = await getManifest();
  const fq = fold(query);
  const theoryHits = [];

  await Promise.all(manifest.topics.map(async (t) => {
    const { body } = parseFrontMatter(await fetchText(`./data/theory/${t.id}.md`).catch(() => ''));
    // Dzielimy na sekcje według nagłówków ##/###
    const sections = body.split(/\n(?=#{2,3} )/);
    for (const sec of sections) {
      const heading = (sec.match(/^#{2,3} (.+)/) || [])[1] || t.title;
      const text = stripMd(sec.replace(/^#{2,3} .+/, ''));
      if (fold(heading).includes(fq) || fold(text).includes(fq)) {
        theoryHits.push({ topic: t, heading, anchor: slugify(stripMd(heading)), text, score: fold(heading).includes(fq) ? 2 : 1 });
      }
    }
  }));
  theoryHits.sort((a, b) => b.score - a.score);

  const questions = await getAllQuestions();
  const qHits = questions.filter((x) => fold(x.question + ' ' + x.answers.join(' ')).includes(fq)).slice(0, 15);

  append(root, 
    h('section.section',
      h('h2', `Teoria (${theoryHits.length})`),
      theoryHits.length
        ? h('ul.list-plain', theoryHits.slice(0, 30).map((r) =>
            h('li', h('a.list-row', { href: `#/teoria/${r.topic.id}`, onclick: () => setTimeout(() => document.getElementById(r.anchor)?.scrollIntoView({ behavior: 'smooth' }), 600) },
              icon('book'),
              h('div.list-row__main',
                h('div.list-row__title', r.heading.replace(/#/g, ''), h('span.faint.small', ` · ${r.topic.title}`)),
                h('div.list-row__sub', snippet(r.text, query))
              )
            ))
          ))
        : h('p.muted', 'Brak wyników w teorii.')
    ),
    h('section.section',
      h('h2', `Pytania (${qHits.length})`),
      qHits.length
        ? h('ul.list-plain', qHits.map((x) =>
            h('li', h('details.review-item',
              h('summary', snippet(x.question, query)),
              h('p', h('strong', 'Odpowiedź: '), x.answers[x.correct]),
              x.explanation ? h('p.muted', x.explanation) : null,
              h('a.small', { href: `#/teoria/${x.topic}` }, 'Teoria z działu →')
            ))
          ))
        : h('p.muted', 'Brak pytań pasujących do frazy.')
    )
  );
}
