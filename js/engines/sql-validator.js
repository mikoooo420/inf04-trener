// =========================================================
// SQL VALIDATOR – porównuje wynik zapytania użytkownika z wzorcem
//  1) liczba kolumn  2) (opcjonalnie) nazwy kolumn
//  3) wiersze jako multizbiór  4) (opcjonalnie) kolejność
// =========================================================

function normValue(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Math.round(v * 1e6) / 1e6;
  if (typeof v === 'bigint') return Number(v);
  if (v instanceof Uint8Array) return `[blob ${v.length}B]`;
  // liczby zapisane jako tekst traktujemy jak liczby (np. '5' vs 5)
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v)) && /^-?\d+(\.\d+)?$/.test(v.trim())) {
    return Math.round(Number(v) * 1e6) / 1e6;
  }
  return v;
}

const rowKey = (row) => JSON.stringify(row.map(normValue));
const sortedRowKey = (row) => JSON.stringify(row.map(normValue).map(String).sort());

function multiset(rows, keyFn = rowKey) {
  const m = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    m.set(k, (m.get(k) || 0) + 1);
  }
  return m;
}

function diffMultiset(a, b) {
  // ile elementów z a brakuje w b
  let missing = 0;
  for (const [k, n] of a) missing += Math.max(0, n - (b.get(k) || 0));
  return missing;
}

/**
 * @param {{columns, values}|null} user
 * @param {{columns, values}|null} expected
 * @param {{orderMatters?: boolean, checkColumnNames?: boolean}} opts
 * @returns {{ pass: boolean, message: string, details?: string[] }}
 */
export function compareResults(user, expected, { orderMatters = false, checkColumnNames = false } = {}) {
  if (!user) {
    return { pass: false, message: 'Zapytanie nie zwróciło tabeli wyników. Czy na pewno to SELECT?' };
  }
  const exp = expected || { columns: [], values: [] };

  if (user.columns.length !== exp.columns.length) {
    return {
      pass: false,
      message: `Zła liczba kolumn: masz ${user.columns.length}, oczekiwano ${exp.columns.length}.`,
      details: [`Oczekiwane kolumny: ${exp.columns.join(', ')}`],
    };
  }

  if (checkColumnNames) {
    const a = user.columns.map((c) => c.toLowerCase());
    const b = exp.columns.map((c) => c.toLowerCase());
    if (a.join('|') !== b.join('|')) {
      return {
        pass: false,
        message: 'Nazwy kolumn nie zgadzają się z poleceniem (sprawdź aliasy AS).',
        details: [`Oczekiwane: ${exp.columns.join(', ')}`, `Twoje: ${user.columns.join(', ')}`],
      };
    }
  }

  const mu = multiset(user.values);
  const me = multiset(exp.values);
  const missing = diffMultiset(me, mu);
  const extra = diffMultiset(mu, me);

  if (missing || extra) {
    // Może tylko kolumny są w innej kolejności?
    const su = multiset(user.values, sortedRowKey);
    const se = multiset(exp.values, sortedRowKey);
    if (!diffMultiset(se, su) && !diffMultiset(su, se)) {
      return { pass: false, message: 'Dane się zgadzają, ale kolumny są w innej kolejności niż w poleceniu.' };
    }
    const details = [];
    if (missing) details.push(`Brakuje ${missing} ${missing === 1 ? 'wiersza' : 'wierszy'} z oczekiwanego wyniku.`);
    if (extra) details.push(`Masz ${extra} ${extra === 1 ? 'nadmiarowy wiersz' : 'nadmiarowych wierszy'}.`);
    details.push(`Oczekiwano ${exp.values.length} wierszy, otrzymano ${user.values.length}.`);
    let message = 'Wynik różni się od oczekiwanego.';
    if (!exp.values.length && user.values.length) message = 'Oczekiwano pustego wyniku – sprawdź warunek WHERE.';
    else if (missing && !extra) message = 'Za mało wierszy – warunek jest zbyt restrykcyjny albo brakuje złączenia (LEFT JOIN?).';
    else if (extra && !missing) message = 'Za dużo wierszy – sprawdź WHERE, DISTINCT albo LIMIT.';
    else if (user.values.length === exp.values.length) message = 'Liczba wierszy się zgadza, ale część z nich ma inne wartości – sprawdź warunek WHERE i obliczenia.';
    return { pass: false, message, details };
  }

  if (orderMatters) {
    const ordered = user.values.every((row, i) => rowKey(row) === rowKey(exp.values[i]));
    if (!ordered) {
      return { pass: false, message: 'Dobre wiersze, ale zła kolejność – sprawdź ORDER BY (ASC/DESC).' };
    }
  }

  return { pass: true, message: 'Wynik zgodny z oczekiwanym!' };
}
