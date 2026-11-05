import { h, append } from '../core/dom.js';
import { icon } from '../core/icons.js';

export default function notFound(root) {
  append(root, 
    h('div.empty',
      icon('search'),
      h('h1', '404 – nie ma takiej strony'),
      h('p', 'Link mógł się zmienić. Wróć na start albo skorzystaj z menu.'),
      h('a.btn.btn--primary', { href: '#/' }, 'Strona główna')
    )
  );
}
