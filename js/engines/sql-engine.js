// =========================================================
// SQL ENGINE – SQLite w przeglądarce (sql.js / WebAssembly)
// =========================================================

import { LIBS } from '../config.js';
import { loadScript, fetchText } from '../core/loader.js';

let sqlPromise = null;

/** Wczytuje sql.js z CDN (tylko raz). */
export function getSQL() {
  if (!sqlPromise) {
    sqlPromise = loadScript(LIBS.sqljs)
      .then(() => window.initSqlJs({ locateFile: (file) => LIBS.sqljsWasmDir + file }))
      .catch((err) => {
        sqlPromise = null;
        throw new Error('Nie udało się wczytać silnika SQLite (sql.js). Sprawdź połączenie z internetem. ' + (err.message || ''));
      });
  }
  return sqlPromise;
}

/** Tworzy świeżą bazę z pliku data/sql/db/<name>.sql */
export async function createDatabase(name) {
  const [SQL, schema] = await Promise.all([getSQL(), fetchText(`./data/sql/db/${name}.sql`)]);
  const db = new SQL.Database();
  db.exec(schema);
  return db;
}

/**
 * Wykonuje (wiele) instrukcji i zwraca wynik OSTATNIEJ instrukcji zwracającej kolumny.
 * W odróżnieniu od db.exec() zwraca też nazwy kolumn, gdy wynik jest pusty.
 * @returns {{ columns: string[], values: any[][] } | null}
 */
export function runQuery(db, sql) {
  let last = null;
  if (typeof db.iterateStatements === 'function') {
    for (const stmt of db.iterateStatements(sql)) {
      try {
        const columns = stmt.getColumnNames();
        const values = [];
        while (stmt.step()) values.push(stmt.get());
        if (columns.length) last = { columns, values };
      } finally {
        stmt.free();
      }
    }
    return last;
  }
  const res = db.exec(sql);
  return res.length ? res[res.length - 1] : null;
}

/** Lista tabel z kolumnami (do panelu schematu). */
export function describeSchema(db) {
  const tables = runQuery(db, "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  if (!tables) return [];
  return tables.values.map(([name]) => {
    const info = runQuery(db, `PRAGMA table_info("${name}")`);
    const fks = runQuery(db, `PRAGMA foreign_key_list("${name}")`);
    const count = runQuery(db, `SELECT COUNT(*) FROM "${name}"`);
    const fkMap = new Map((fks?.values || []).map((row) => [row[3], `${row[2]}.${row[4]}`]));
    return {
      name,
      rows: count?.values?.[0]?.[0] ?? 0,
      columns: (info?.values || []).map(([, col, type, notnull, , pk]) => ({
        name: col, type: type || '', notnull: !!notnull, pk: !!pk, fk: fkMap.get(col) || null,
      })),
    };
  });
}

/** Tłumaczy typowe komunikaty SQLite na polski z podpowiedzią. */
export function explainSqlError(message = '') {
  const m = String(message);
  let r;
  if ((r = m.match(/no such table: (\S+)/i))) return `Nie ma tabeli „${r[1]}”. Sprawdź nazwę w panelu schematu (wielkość liter i polskie znaki).`;
  if ((r = m.match(/no such column: (\S+)/i))) return `Nie ma kolumny „${r[1]}”. Sprawdź nazwę lub alias tabeli.`;
  if ((r = m.match(/ambiguous column name: (\S+)/i))) return `Kolumna „${r[1]}” występuje w kilku tabelach – poprzedź ją nazwą tabeli, np. tabela.${r[1]}.`;
  if ((r = m.match(/near "([^"]*)": syntax error/i))) return `Błąd składni w pobliżu „${r[1]}”. Sprawdź przecinki, cudzysłowy i kolejność klauzul (SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT).`;
  if (/incomplete input/i.test(m)) return 'Zapytanie jest niedokończone – brakuje nawiasu, cudzysłowu lub fragmentu instrukcji.';
  if (/misuse of aggregate/i.test(m)) return 'Niewłaściwe użycie funkcji agregującej. Warunki na COUNT/SUM/AVG umieszczamy w HAVING, nie w WHERE.';
  if (/UNIQUE constraint failed/i.test(m)) return 'Naruszenie unikalności – taka wartość klucza już istnieje.';
  if (/NOT NULL constraint failed: (\S+)/i.test(m)) return `Kolumna ${m.match(/failed: (\S+)/)[1]} nie może być pusta (NOT NULL).`;
  if (/FOREIGN KEY constraint failed/i.test(m)) return 'Naruszenie klucza obcego – odwołujesz się do nieistniejącego rekordu.';
  return `Błąd SQL: ${m}`;
}
