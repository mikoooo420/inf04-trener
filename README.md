# INF.04 Trener

Darmowa, otwarta (open-source) aplikacja webowa do nauki i przygotowania do egzaminu zawodowego **INF.04 – Projektowanie, programowanie i testowanie aplikacji** (technik programista).

Działa w całości w przeglądarce – bez serwera, bez logowania, bez instalacji. Postępy zapisują się w LocalStorage przeglądarki. Można ją za darmo hostować na **GitHub Pages**.

> **Wersja online:** https://mikoooo420.github.io/inf04-trener/

---

## Co jest w środku

| Moduł | Opis |
|---|---|
| **Teoria w pigułce** | 13 działów zgodnych z zakresem INF.04, z przykładami kodu w kilku językach, tipami CKE, pułapkami i spisem treści. Na końcu każdego działu – mini-test. |
| **Quizy tematyczne** | 203 autorskie pytań w formacie CKE (A–D), natychmiastowa informacja zwrotna z wyjaśnieniem, pytania „co wypisze program” z przełącznikiem języka (C++/C#/Java/Python/JS). |
| **Symulacja egzaminu** | 40 pytań, 60 minut, próg 50%, proporcje działów jak na egzaminie, mapa pytań, flagi, wynik z podziałem na działy i przeglądem odpowiedzi. |
| **Powtórki (Leitner)** | Błędne odpowiedzi wracają częściej, opanowane – rzadziej. |
| **Code Lab** | 30 zadań: 20 algorytmicznych (tablice, napisy, OOP; wzorcowe rozwiązania w JS, C++, C#, Javie i Pythonie), 5 w **TypeScripcie** (prawdziwy kompilator, błędy typów po polsku) i 5 w **Node.js** (moduły, `fs`, `process.argv`, REST API w **Express**) – testy uruchamiane w Web Workerze. |
| **Pracownia GUI** | 18 ćwiczeń w 9 technologiach: **WPF, Windows Forms, JavaFX, .NET MAUI, Android (Java i Kotlin), React, React + TypeScript, Angular**. Wieloplikowy edytor (XAML/XML/FXML + kod), statyczne sprawdzanie layoutu i obsługi zdarzeń, React z podglądem na żywo i testami działania. Ściąga kontrolek dla wszystkich technologii. |
| **SQL Lab** | 18 zadań na prawdziwym SQLite (sql.js / WebAssembly) z walidacją wyników na żywo i podpowiedziami po polsku. |
| **Arkusze praktyczne** | 3 arkusze treningowe w układzie zbliżonym do egzaminu: konsola + aplikacja z interfejsem + dokumentacja, timer 180 min, kryteria samooceny. Część z interfejsem w **9 wariantach** do wyboru (HTML/JS, React, Angular, WPF, WinForms, JavaFX, MAUI, Android Java/Kotlin) z automatycznymi testami. |
| **Postępy** | Ogólna gotowość, wykres wyników symulacji, skuteczność w działach, mapa aktywności, eksport/import postępów do pliku. |

Dodatkowo: motyw jasny/ciemny, pełna obsługa klawiatury (1–4 / A–D, Enter, strzałki), responsywny układ (RWD), wyszukiwarka (`/`), działanie offline (PWA).

## Technologie

- **HTML5 + CSS** (zmienne CSS, Grid, Flexbox, media queries) – bez frameworków CSS,
- **Vanilla JavaScript (ES Modules)** – bez kroku budowania (bez npm/webpack),
- biblioteki dołączone lokalnie w `/vendor`: [marked](https://github.com/markedjs/marked) (Markdown), [DOMPurify](https://github.com/cure53/DOMPurify) (sanityzacja HTML), [highlight.js](https://highlightjs.org/) (kolorowanie składni),
- [React](https://react.dev/) i kompilator [TypeScript](https://www.typescriptlang.org/) – dołączone w `/vendor`, ładowane leniwie tylko w zadaniach, które ich potrzebują (TS kompiluje się w Web Workerze),
- [sql.js](https://github.com/sql-js/sql.js) (SQLite w WebAssembly) – ładowany z CDN tylko w SQL Lab.

## Struktura projektu

```
inf04-trener/
├── index.html              # powłoka aplikacji (jedyna strona HTML)
├── manifest.webmanifest    # PWA
├── sw.js                   # Service Worker – działanie offline
├── .nojekyll               # wyłącza Jekylla na GitHub Pages
├── assets/icons/           # favicon i ikony PWA
├── css/
│   ├── tokens.css          # zmienne: kolory obu motywów, odstępy, typografia
│   ├── base.css            # reset, typografia, kolory składni
│   ├── layout.css          # topbar, sidebar, RWD
│   ├── components.css      # przyciski, karty, callouty, formularze…
│   └── views/              # style poszczególnych widoków
├── js/
│   ├── main.js             # start aplikacji + definicje tras
│   ├── config.js           # stałe (parametry egzaminu, wersje bibliotek)
│   ├── core/               # router, store, storage, loader, theme, dom, icons
│   ├── components/         # navbar, karta pytania, edytor kodu, timer, modal…
│   ├── engines/            # quiz, Leitner, statystyki, SQL, code runner, TS, testy DOM i GUI
│   ├── utils/              # markdown, formatowanie, losowanie
│   └── views/              # widoki (jeden plik = jedna strona)
├── data/
│   ├── manifest.json       # lista działów i ich wagi na egzaminie
│   ├── theory/*.md         # teoria (Markdown + callouty [!CKE], [!PULAPKA]…)
│   ├── questions/*.json    # pytania – jeden plik na dział
│   ├── sql/                # zadania SQL + bazy danych (*.sql)
│   ├── code/tasks.json     # zadania Code Lab (JS, TS, Node.js)
│   ├── gui/                # Pracownia GUI: tasks.json + ściąga kontrolek
│   └── projects/           # arkusze praktyczne (z wariantami technologii)
├── vendor/                 # biblioteki zewnętrzne (z licencjami)
├── tools/validate-data.mjs # walidator treści
├── docs/WDROZENIE.md       # instrukcja publikacji na GitHub Pages
└── .github/                # GitHub Actions + szablony zgłoszeń
```

## Uruchomienie lokalne

Aplikacja wczytuje pliki JSON i Markdown przez `fetch()`, dlatego **nie zadziała po dwukliku w `index.html`** (adres `file://`). Uruchom dowolny prosty serwer HTTP w folderze projektu:

```bash
# Python (zwykle już zainstalowany)
python -m http.server 8000
# a potem otwórz http://localhost:8000
```

albo w **VS Code** zainstaluj rozszerzenie *Live Server* i kliknij prawym przyciskiem `index.html` → *Open with Live Server*.

## Publikacja na GitHub Pages

Krótko: wrzuć pliki do publicznego repozytorium → **Settings → Pages → Deploy from a branch → `main` / `(root)` → Save**. Pełna instrukcja krok po kroku, z wariantem bez znajomości Gita: **[docs/WDROZENIE.md](docs/WDROZENIE.md)**.

## Dodawanie treści

Pytania, zadania i teorię dopisujesz w plikach w `data/` – bez znajomości JavaScriptu. Opis formatów i zasad: **[CONTRIBUTING.md](CONTRIBUTING.md)**. Przed wysłaniem zmian uruchom walidator:

```bash
node tools/validate-data.mjs
```

## Licencje

- **Kod** – licencja MIT ([LICENSE](LICENSE)).
- **Treści edukacyjne** (`data/`) – licencja CC BY-SA 4.0 ([LICENSE-CONTENT.md](LICENSE-CONTENT.md)).
- **Biblioteki zewnętrzne** – zgodnie z ich licencjami ([vendor/LICENSES.md](vendor/LICENSES.md)).

## Zastrzeżenie

Projekt jest niezależny i nie jest powiązany z Centralną Komisją Egzaminacyjną. Pytania i zadania są autorskie, przygotowane w stylu egzaminu. Aktualne informatory, przykładowe arkusze i zasady egzaminu znajdziesz na stronie [CKE](https://cke.gov.pl/egzamin-zawodowy/) oraz w okręgowych komisjach egzaminacyjnych.
