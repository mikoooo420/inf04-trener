// Odliczanie czasu (egzamin, arkusz praktyczny)
import { h } from '../core/dom.js';
import { formatClock } from '../utils/format.js';

/**
 * @param {number} totalSec  czas całkowity
 * @param {object} opts { onEnd, warnAt (sek.), startElapsed }
 */
export function createTimer(totalSec, { onEnd, warnAt = 300, startElapsed = 0 } = {}) {
  const label = h('span.timer__value', formatClock(totalSec - startElapsed));
  const el = h('div.timer', { role: 'timer', 'aria-live': 'off' }, label);
  let elapsed = startElapsed;
  let interval = null;
  let lastTick = 0;

  function tick() {
    const now = performance.now();
    elapsed += (now - lastTick) / 1000;
    lastTick = now;
    const left = Math.max(0, totalSec - elapsed);
    label.textContent = formatClock(left);
    el.classList.toggle('is-warning', left <= warnAt && left > 60);
    el.classList.toggle('is-danger', left <= 60);
    if (left <= 0) {
      clearInterval(interval);
      interval = null;
      onEnd?.();
    }
  }

  function start() {
    if (interval) return;
    lastTick = performance.now();
    interval = setInterval(tick, 250);
    el.classList.remove('is-paused');
  }
  function stop() {
    if (!interval) return;
    clearInterval(interval);
    interval = null;
    const now = performance.now();
    elapsed += (now - lastTick) / 1000;
    lastTick = now;
  }
  function pause() {
    stop();
    el.classList.add('is-paused');
  }

  return {
    el,
    start,
    stop,
    pause,
    get running() { return !!interval; },
    get elapsed() { return interval ? elapsed + (performance.now() - lastTick) / 1000 : elapsed; },
  };
}
