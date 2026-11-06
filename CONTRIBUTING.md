# Jak współtworzyć INF.04 Trener

Dziękujemy, że chcesz pomóc! Najcenniejsze są nowe pytania, zadania i poprawki merytoryczne. Wszystkie treści leżą w folderze `data/` i nie wymagają znajomości JavaScriptu.

## Zasady merytoryczne

1. **Treści autorskie.** Nie kopiuj arkuszy CKE ani treści z innych serwisów. Możesz wzorować się na stylu i zakresie egzaminu, ale pytania pisz własnymi słowami.
2. **Jedna poprawna odpowiedź**, trzy wiarygodne dystraktory (błędne odpowiedzi, które ktoś mógłby wybrać).
3. **Wyjaśnienie** (`explanation`) jest obowiązkowe w praktyce – mówi, *dlaczego* odpowiedź jest dobra, a pozostałe złe.
4. **Tip CKE** (`tip`) – tylko jeśli naprawdę pomaga na egzaminie (słowo-klucz, typowa pułapka).
5. Pisz poprawną polszczyzną, z polskimi znakami.

## Pytanie testowe – `data/questions/<dział>.json`

```json
{
  "id": "oop-019",
  "difficulty": 2,
  "question": "Co wypisze program?",
  "code": [
    { "lang": "cpp", "src": "..." },
    { "lang": "python", "src": "..." }
  ],
  "answers": ["A", "B", "C", "D"],
  "correct": 1,
  "explanation": "Dlaczego B jest poprawne…",
  "tip": "Opcjonalna wskazówka egzaminacyjna."
}
```

| Pole | Opis |
|---|---|
| `id` | unikalny identyfikator: prefiks działu + numer (np. `oop-019`) |
| `difficulty` | 1 – łatwe, 2 – średnie, 3 – trudne |
| `question` | treść pytania |
| `code` | opcjonalnie: obiekt `{lang, src}` lub tablica wariantów (`cpp`, `csharp`, `java`, `python`, `javascript`, `sql`, `xml`, `css`) – użytkownik przełącza języki zakładkami |
| `answers` | 4 odpowiedzi (kolejność jest losowana w aplikacji; jeśli nie może być – dodaj `"fixedOrder": true`) |
| `correct` | **indeks** poprawnej odpowiedzi liczony od 0 |
| `explanation`, `tip` | wyjaśnienie i opcjonalny tip |

Prefiksy działów: `alg`, `str`, `pod`, `sys`, `oop`, `inz`, `tst`, `dm`, `web`, `bd`, `nar`, `bez`, `dos`.

## Teoria – `data/theory/<dział>.md`

Zwykły Markdown (GitHub Flavored: tabele, bloki kodu z językiem). Nagłówki `##` tworzą spis treści. Specjalne bloki:

```markdown
> [!CKE]
> Tip egzaminacyjny.

> [!PULAPKA]
> Typowy błąd.

> [!WZOR] Własny tytuł bloku
> Coś do zapamiętania.

> [!INFO]
> Ciekawostka.
```

W tabelach znak `|` wewnątrz kodu zapisuj jako `\|`.

## Zadanie SQL – `data/sql/tasks.json`

```json
{
  "id": "sql-019",
  "group": "Złączenia",
  "db": "sklep",
  "title": "Krótki tytuł",
  "difficulty": 2,
  "concepts": ["JOIN", "GROUP BY"],
  "prompt": "Treść w **Markdown**.",
  "solution": "SELECT …;",
  "orderMatters": false,
  "checkColumnNames": false,
  "hints": ["Podpowiedź 1", "Podpowiedź 2"]
}
```

- Wynik zapytania użytkownika jest porównywany z wynikiem `solution` na świeżej kopii bazy.
- `orderMatters: true` – gdy polecenie wymaga sortowania; `checkColumnNames: true` – gdy wymagane są konkretne aliasy.
- Zadania modyfikujące dane: `"mode": "dml"` + `"check": "SELECT … ORDER BY id;"` – porównywany jest stan bazy po wykonaniu.
- Bazy danych to skrypty w `data/sql/db/*.sql` (SQLite).

## Zadanie Code Lab – `data/code/tasks.json`

```json
{
  "id": "js-021",
  "group": "Algorytmy liczbowe",
  "title": "…",
  "difficulty": 2,
  "summary": "Jedno zdanie na liście zadań.",
  "concepts": ["pętla"],
  "prompt": "Treść w Markdown.",
  "fn": "nazwaFunkcji",
  "starter": "function nazwaFunkcji(n) {\n}\n",
  "tests": [{ "args": [5], "expected": 120 }],
  "hiddenTests": [{ "args": [0], "expected": 1 }],
  "hints": ["…"],
  "solutions": { "js": "…", "cpp": "…", "csharp": "…", "python": "…" }
}
```

Testy mogą też używać wyrażenia: `{ "expr": "new Klasa(2).metoda()", "expected": 4, "name": "opis testu" }` – przydatne przy zadaniach obiektowych. Walidator sprawdza, czy rozwiązanie wzorcowe w JS przechodzi wszystkie testy.

**TypeScript** (`"lang": "ts"`): kod przechodzi przez kompilator w trybie `strict`; zadanie zalicza się tylko bez błędów typów. Rozwiązanie wzorcowe w `solutions.ts`.

**Node.js** (`"lang": "node"`): kod działa jak moduł CommonJS z atrapami `require('express')`, `require('fs')` (wirtualne pliki) i `require('path')`. Rodzaje testów:

- `{ "expr": "m.funkcja(2)", "expected": 4 }` – `m` to `module.exports`,
- `{ "argv": ["5", "3"], "output": "8" }` – argumenty `process.argv` i oczekiwane wyjście konsoli,
- `{ "files": { "dane.txt": "…" }, "fsExpect": { "wynik.txt": "…" } }` – pliki wejściowe i oczekiwana zawartość zapisanych plików,
- `{ "http": [{ "method": "POST", "url": "/api/x", "body": {…}, "expect": { "status": 201, "body": {…} } }] }` – żądania do aplikacji Express (kolejne żądania współdzielą stan; `expect` jest opcjonalny dla żądań przygotowujących).

## Ćwiczenie Pracowni GUI – `data/gui/tasks.json`

Plik ma listę technologii (`technologies`) i ćwiczeń (`tasks`). Ćwiczenie składa się z plików (`files`: `name` + `starter`), rozwiązania (`solution`: nazwa pliku → treść) i testów statycznych (`checks`):

| `type` | Co sprawdza |
|---|---|
| `wellformed` | plik XML (XAML/FXML/layout Androida) jest poprawny składniowo |
| `element` | istnieje element `tag` (alternatywy `A\|B`, regex `re:…`) z atrybutami `attrs` (`"*"` = dowolna niepusta wartość, `re:…` = regex) i opcjonalnie tekstem `text` |
| `count` | co najmniej `min` elementów `tag` (opcjonalnie wewnątrz `within`) |
| `handler` | atrybut zdarzenia (`Click`, `Clicked`, `onAction`, `(click)`) wskazuje metodę istniejącą w `codeFile` |
| `handlerRegex` | jak wyżej, ale nazwę metody wyciąga grupa 1 wyrażenia `match` (np. `btn.Click += metoda` w WinForms) |
| `code` / `notcode` | plik zawiera / nie zawiera dopasowania wyrażenia `match` (komentarze są pomijane) |

Ćwiczenia React (`"runnable": "react"`, plik `App.jsx`/`App.tsx` + opcjonalnie `App.css`) mają dodatkowo `domChecks` – te same kroki co testy DOM arkuszy.

## Arkusz praktyczny – `data/projects/projects.json`

Każdy arkusz ma części (`parts`): `checklist` (kryteria do samooceny) lub `web` (piaskownica HTML/CSS/JS + testy automatyczne `checks`). Kroki testów DOM: `exists`, `set`/`value`, `check`/`checked`, `select`/`value`, `click`, `expectText` (`equals`/`contains`/`matches`), `expectValue`, `expectAttr`, `expectStyle`, `expectCount`, `wait`. Część `web` może mieć listę `variants` – wykonanie w innej technologii (React, Angular, WPF, WinForms, JavaFX, MAUI, Android). Wariant ma taki sam format jak ćwiczenie Pracowni GUI (`files`, `solution`, `checks`, `domChecks`, `runnable`) oraz własne `brief` i `criteria`. Najprościej zacząć od skopiowania istniejącego arkusza.

## Przed wysłaniem zmian

```bash
node tools/validate-data.mjs   # sprawdza poprawność wszystkich danych
python -m http.server 8000     # obejrzyj zmiany w przeglądarce
```

## Kod aplikacji

- Bez kroku budowania: czysty JavaScript (ES Modules), HTML i CSS.
- Kolory i odstępy tylko przez zmienne z `css/tokens.css` (oba motywy).
- Nowy widok = nowy plik w `js/views/` + trasa w `js/main.js`.
- Dbaj o dostępność: obsługa klawiatury, etykiety, kontrast.

## Zgłaszanie błędów

Użyj zakładki **Issues** i szablonu „Błąd w treści” lub „Nowe pytanie”. Podaj identyfikator pytania/zadania (np. `oop-005`).
