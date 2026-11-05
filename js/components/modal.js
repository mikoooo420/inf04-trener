// Okno dialogowe oparte na natywnym <dialog> (dostępność + obsługa Esc za darmo)
import { h } from '../core/dom.js';

export function confirmDialog({ title, message, confirmText = 'OK', cancelText = 'Anuluj', danger = false }) {
  return new Promise((resolve) => {
    const dialog = h('dialog.modal', { 'aria-labelledby': 'modal-title' },
      h('div.modal__body',
        h('h2#modal-title', title),
        typeof message === 'string' ? h('p.muted', message) : message
      ),
      h('div.modal__foot',
        cancelText ? h('button.btn.btn--ghost', { type: 'button', onclick: () => close(false) }, cancelText) : null,
        h(`button.btn.${danger ? 'btn--danger' : 'btn--primary'}`, { type: 'button', onclick: () => close(true) }, confirmText)
      )
    );
    function close(value) {
      dialog.close();
      dialog.remove();
      resolve(value);
    }
    dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(false); });
    document.body.append(dialog);
    dialog.showModal();
    dialog.querySelector('.modal__foot .btn:last-child')?.focus();
  });
}

export function alertDialog(title, message) {
  return confirmDialog({ title, message, confirmText: 'Rozumiem', cancelText: null });
}
