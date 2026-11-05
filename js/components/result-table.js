// Tabela wyników zapytania SQL
import { h } from '../core/dom.js';
import { plural } from '../utils/format.js';

export function resultTable(result, { maxRows = 200, caption } = {}) {
  if (!result) return h('p.muted.small', 'Brak tabeli wyników.');
  const rows = result.values.slice(0, maxRows);
  return h('div',
    h('div.table-wrap',
      h('table.data-table',
        caption ? h('caption.sr-only', caption) : null,
        h('thead', h('tr', result.columns.map((c) => h('th', { scope: 'col' }, c)))),
        h('tbody',
          rows.length
            ? rows.map((r) => h('tr', r.map((v) => (v === null ? h('td.null', 'NULL') : h('td', String(v))))))
            : h('tr', h('td.muted', { colspan: result.columns.length || 1 }, '(pusty wynik – 0 wierszy)'))
        )
      )
    ),
    h('p.small.faint', { style: 'margin:.4rem 0 0' },
      `${result.values.length} ${plural(result.values.length, ['wiersz', 'wiersze', 'wierszy'])}${result.values.length > maxRows ? ` (pokazano ${maxRows})` : ''}`)
  );
}
