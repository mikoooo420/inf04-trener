// Pierścień i pasek postępu
import { h } from '../core/dom.js';

const NS = 'http://www.w3.org/2000/svg';

export function progressRing(ratio, { size = 28, stroke = 4, color } = {}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('class', 'ring');
  svg.setAttribute('aria-hidden', 'true');
  const bg = document.createElementNS(NS, 'circle');
  const fg = document.createElementNS(NS, 'circle');
  for (const el of [bg, fg]) {
    el.setAttribute('cx', size / 2);
    el.setAttribute('cy', size / 2);
    el.setAttribute('r', r);
    el.setAttribute('stroke-width', stroke);
  }
  bg.setAttribute('class', 'ring__bg');
  fg.setAttribute('class', 'ring__fg');
  fg.setAttribute('stroke-dasharray', c);
  fg.setAttribute('stroke-dashoffset', c * (1 - Math.max(0, Math.min(1, ratio))));
  if (color) fg.style.stroke = color;
  svg.append(bg, fg);
  return svg;
}

export function progressBar(ratio, { variant = '', label } = {}) {
  const pct = Math.round(Math.max(0, Math.min(1, ratio)) * 100);
  const bar = h('div.progress__bar');
  const el = h(`div.progress${variant ? '.progress--' + variant : ''}`,
    { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': pct, 'aria-label': label || 'Postęp' },
    bar
  );
  requestAnimationFrame(() => { bar.style.width = pct + '%'; });
  return el;
}

export function difficulty(level = 1) {
  return h('span.diff', { title: `Trudność: ${level}/3`, 'aria-label': `Trudność ${level} na 3` },
    [1, 2, 3].map((i) => h(`i${i <= level ? '.on' : ''}`)));
}
