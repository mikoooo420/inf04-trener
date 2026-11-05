// Krótkie powiadomienia w rogu ekranu
import { h } from '../core/dom.js';

export function toast(message, type = 'info', ms = 3200) {
  const region = document.getElementById('toast-region');
  if (!region) return;
  const el = h(`div.toast.toast--${type}`, { role: 'status' }, message);
  region.append(el);
  const remove = () => {
    el.classList.add('is-leaving');
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 400);
  };
  setTimeout(remove, ms);
  el.addEventListener('click', remove);
}
