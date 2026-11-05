// Zadanie SQL z walidacją na żywo
import { h, setChildren, append } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { store } from '../core/store.js';
import { getSqlTasks } from '../core/loader.js';
import { renderMarkdown } from '../utils/markdown.js';
import { createEditor } from '../components/code-editor.js';
import { resultTable } from '../components/result-table.js';
import { difficulty } from '../components/progress.js';
import { confirmDialog } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { createDatabase, runQuery, describeSchema, explainSqlError } from '../engines/sql-engine.js';
import { compareResults } from '../engines/sql-validator.js';
import { plural } from '../utils/format.js';

export default async function sqlTask(root, { id }) {
  const tasks = await getSqlTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) {
    append(root, h('div.empty', h('h2', 'Nie ma takiego zadania'), h('a.btn', { href: '#/sql' }, 'Lista zadań')));
    return;
  }
  const task = tasks[idx];
  const next = tasks[idx + 1];
  document.title = `${task.title} · SQL Lab`;

  const saved = store.get().sql[id] || {};
  const output = h('div.lab-output', { 'aria-live': 'polite' },
    h('p.muted.small', 'Napisz zapytanie i kliknij „Sprawdź” (Ctrl+Enter).'));
  const statusBadge = h('span');
  const schemaHost = h('div.schema', h('div.loading', h('span.spinner'), ' Wczytywanie bazy SQLite…'));
  const hintsHost = h('div.hints');
  let hintsShown = 0;
  let saveTimer;

  const editor = createEditor({
    value: saved.lastQuery ?? (task.starter || '-- Twoje zapytanie\nSELECT '),
    lang: 'sql',
    label: 'Edytor SQL',
    minLines: 8,
    onRun: () => check(),
    onChange: (v) => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => store.update((s) => { (s.sql[id] ||= {}).lastQuery = v; }, { silent: true }), 400);
    },
  });

  function paintStatus() {
    const st = store.get().sql[id];
    setChildren(statusBadge, 
      st?.solved
        ? h('span.badge.badge--success', icon('check'), 'Rozwiązane')
        : st?.attempts ? h('span.badge.badge--warning', `Próby: ${st.attempts}`) : h('span.badge', 'Nowe')
    );
  }
  paintStatus();

  const checkBtn = h('button.btn.btn--primary', { type: 'button', onclick: () => check() }, icon('check'), 'Sprawdź');
  const runBtn = h('button.btn', { type: 'button', onclick: () => run() }, icon('play'), 'Uruchom');
  const resetBtn = h('button.btn.btn--ghost', {
    type: 'button',
    onclick: async () => {
      if (await confirmDialog({ title: 'Wyczyścić edytor?', message: 'Twoje zapytanie zostanie zastąpione szablonem.', confirmText: 'Wyczyść' })) {
        editor.setValue(task.starter || 'SELECT ');
      }
    },
  }, icon('refresh'), 'Reset');
  const solutionBtn = h('button.btn.btn--ghost', { type: 'button', onclick: showSolution }, icon('eye'), 'Rozwiązanie');
  const hintBtn = h('button.btn.btn--ghost', { type: 'button', onclick: nextHint }, icon('bulb'), 'Podpowiedź');

  function nextHint() {
    if (hintsShown >= task.hints.length) return;
    hintsHost.append(h('aside.callout.callout--info', h('div.callout__title', icon('bulb'), h('span', `Podpowiedź ${hintsShown + 1}`)), h('p', task.hints[hintsShown])));
    hintsShown++;
    if (hintsShown >= task.hints.length) hintBtn.disabled = true;
  }

  async function showSolution() {
    const ok = await confirmDialog({
      title: 'Pokazać rozwiązanie?',
      message: 'Spróbuj najpierw z podpowiedziami. Zadanie zostanie oznaczone jako rozwiązane z pomocą.',
      confirmText: 'Pokaż',
    });
    if (!ok) return;
    store.update((s) => { (s.sql[id] ||= {}).usedSolution = true; }, { silent: true });
    hintsHost.append(h('aside.callout.callout--formula', h('div.callout__title', icon('eye'), h('span', 'Wzorcowe rozwiązanie')),
      h('pre', h('code', task.solution)),
      h('button.btn.btn--sm', { type: 'button', onclick: () => editor.setValue(task.solution) }, icon('copy'), 'Wstaw do edytora')));
    solutionBtn.disabled = true;
  }

  async function execute(sql) {
    const db = await createDatabase(task.db);
    try {
      const res = runQuery(db, sql);
      const check = task.mode === 'dml' ? runQuery(db, task.check) : null;
      return { res, check };
    } finally {
      db.close();
    }
  }

  async function run() {
    const sql = editor.getValue();
    if (!sql.trim()) return;
    setBusy(true);
    try {
      const { res, check } = await execute(sql);
      setChildren(output, 
        h('div.lab-verdict', icon('play'), h('strong', 'Wynik zapytania'), h('span.muted.small', '(bez sprawdzania)')),
        task.mode === 'dml' ? h('p.small.muted', `Stan po wykonaniu – ${task.check}`) : null,
        resultTable(task.mode === 'dml' ? check : res)
      );
    } catch (err) {
      showError(err);
    } finally {
      setBusy(false);
    }
  }

  async function check() {
    const sql = editor.getValue();
    if (!sql.trim() || /^\s*(--.*\n?)*\s*(SELECT\s*)?$/i.test(sql)) {
      setChildren(output, h('p.small', { style: 'color:var(--danger)' }, 'Najpierw napisz zapytanie.'));
      return;
    }
    setBusy(true);
    try {
      const [user, expected] = await Promise.all([execute(sql), execute(task.solution)]);
      const verdict = task.mode === 'dml'
        ? compareResults(user.check, expected.check, { orderMatters: true })
        : compareResults(user.res, expected.res, { orderMatters: task.orderMatters, checkColumnNames: task.checkColumnNames });

      const wasSolved = !!store.get().sql[id]?.solved;
      store.update((s) => {
        const rec = (s.sql[id] ||= {});
        rec.attempts = (rec.attempts || 0) + 1;
        if (verdict.pass && !rec.solved) { rec.solved = true; rec.solvedAt = new Date().toISOString(); }
        rec.lastQuery = sql;
      }, { scope: 'sql' });
      paintStatus();
      if (verdict.pass && !wasSolved) toast('Zadanie rozwiązane!', 'success');

      setChildren(output, 
        h(`div.lab-verdict.${verdict.pass ? 'is-pass' : 'is-fail'}`, icon(verdict.pass ? 'check' : 'x'), h('strong', verdict.message)),
        verdict.details ? h('ul.small', verdict.details.map((d) => h('li', d))) : null,
        verdict.pass && next ? h('a.btn.btn--success.btn--sm', { href: `#/sql/${next.id}`, style: 'margin-bottom:1rem' }, 'Następne zadanie', icon('arrowRight')) : null,
        h('div.lab-compare',
          h('div', h('h3.lab-sub', task.mode === 'dml' ? 'Stan tabeli – Twój' : 'Twój wynik'), resultTable(task.mode === 'dml' ? user.check : user.res, { maxRows: 50 })),
          !verdict.pass && task.showExpected !== false
            ? h('div', h('h3.lab-sub', 'Oczekiwany wynik'), resultTable(task.mode === 'dml' ? expected.check : expected.res, { maxRows: 50 }))
            : null
        )
      );
    } catch (err) {
      store.update((s) => { const rec = (s.sql[id] ||= {}); rec.attempts = (rec.attempts || 0) + 1; }, { scope: 'sql', silent: true });
      paintStatus();
      showError(err);
    } finally {
      setBusy(false);
    }
  }

  function showError(err) {
    setChildren(output, 
      h('div.lab-verdict.is-fail', icon('alert'), h('strong', explainSqlError(err.message))),
      h('pre.lab-raw', err.message)
    );
  }

  function setBusy(b) {
    checkBtn.disabled = b;
    runBtn.disabled = b;
  }

  const prompt = await renderMarkdown(task.prompt);

  append(root, 
    h('nav.breadcrumbs', h('a', { href: '#/sql' }, 'SQL Lab'), h('span', { 'aria-hidden': 'true' }, '/'), h('span', task.title)),
    h('div.lab',
      h('section.lab-task',
        h('div.lab-task__head', h('h1', task.title), statusBadge),
        h('div.lab-task__meta', difficulty(task.difficulty), ...task.concepts.map((c) => h('span.badge', c))),
        prompt.el,
        task.orderMatters ? h('p.small.muted', icon('info'), ' Kolejność wierszy ma znaczenie.') : null,
        task.checkColumnNames ? h('p.small.muted', icon('info'), ' Nazwy kolumn (aliasy) muszą być zgodne z poleceniem.') : null,
        hintsHost,
        h('details.schema-box', { open: true }, h('summary', icon('database'), ` Schemat bazy „${task.db}”`), schemaHost)
      ),
      h('section.lab-work',
        editor.el,
        h('div.lab-actions', checkBtn, runBtn, h('span.lab-actions__spacer'), task.hints.length ? hintBtn : null, solutionBtn, resetBtn),
        output
      )
    )
  );

  // Schemat bazy ładujemy po wyrenderowaniu (sql.js może się chwilę ładować)
  createDatabase(task.db)
    .then((db) => {
      const tables = describeSchema(db);
      setChildren(schemaHost, ...tables.map((t) =>
        h('div.schema-table',
          h('div.schema-table__name',
            h('strong', t.name), h('span.faint.small', `${t.rows} ${plural(t.rows, ['wiersz', 'wiersze', 'wierszy'])}`),
            h('button.btn.btn--ghost.btn--sm', {
              type: 'button',
              onclick: () => {
                const sql = `SELECT * FROM ${t.name} LIMIT 20;`;
                const r = runQueryOnFresh(sql);
                r.then((res) => setChildren(output, h('div.lab-verdict', icon('eye'), h('strong', `Podgląd: ${t.name}`)), resultTable(res)));
              },
            }, 'podgląd')
          ),
          h('ul', t.columns.map((c) =>
            h('li',
              c.pk ? h('span.key.key--pk', { title: 'Klucz główny' }, 'PK') : c.fk ? h('span.key.key--fk', { title: `Klucz obcy → ${c.fk}` }, 'FK') : h('span.key'),
              h('span.schema-col', c.name),
              h('span.faint', c.type.toLowerCase())
            )
          ))
        )
      ));
      db.close();
    })
    .catch((err) => {
      setChildren(schemaHost, h('p.small', { style: 'color:var(--danger)' }, err.message));
    });

  async function runQueryOnFresh(sql) {
    const db = await createDatabase(task.db);
    try { return runQuery(db, sql); } finally { db.close(); }
  }

  return () => clearTimeout(saveTimer);
}
