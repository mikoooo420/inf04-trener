# Wdrożenie na GitHub Pages – krok po kroku

GitHub Pages hostuje statyczne strony (HTML/CSS/JS) **za darmo** bezpośrednio z repozytorium. INF.04 Trener nie potrzebuje serwera ani bazy danych, więc nadaje się do tego idealnie.

---

## 0. Zanim zaczniesz

- Konto na [github.com](https://github.com) (darmowe).
- Folder projektu `inf04-trener` na dysku.
- (Opcjonalnie) [Git](https://git-scm.com/downloads) albo [GitHub Desktop](https://desktop.github.com/) – jeśli chcesz wygodnie aktualizować projekt.

> **Ważne:** w darmowym planie GitHub Pages działa dla repozytoriów **publicznych**.

---

## 1. Sprawdź projekt lokalnie

Aplikacja ładuje dane przez `fetch()`, więc otwórz ją przez lokalny serwer, a nie dwuklikiem:

```bash
cd ścieżka/do/inf04-trener
python -m http.server 8000
```

Wejdź na `http://localhost:8000` i sprawdź, czy wszystko działa (teoria, quiz, Code Lab, SQL Lab).

Alternatywa: VS Code → rozszerzenie **Live Server** → prawy klik na `index.html` → *Open with Live Server*.

Możesz też uruchomić walidator treści (wymaga Node.js):

```bash
node tools/validate-data.mjs
```

---

## 2. Utwórz repozytorium na GitHubie

1. Zaloguj się na github.com.
2. Kliknij **+** (prawy górny róg) → **New repository**.
3. **Repository name:** `inf04-trener` (ta nazwa pojawi się w adresie strony).
4. Zaznacz **Public**.
5. **Nie** zaznaczaj „Add a README file” (projekt ma już własny README).
6. Kliknij **Create repository**.

---

## 3A. Wysłanie plików przez przeglądarkę (bez Gita)

1. Na stronie pustego repozytorium kliknij link **uploading an existing file**.
2. Otwórz folder `inf04-trener` na dysku, zaznacz **całą jego zawartość** (`Ctrl+A`) i przeciągnij do okna przeglądarki.
   - Przeciągnij **zawartość** folderu, a nie sam folder – `index.html` musi trafić do katalogu głównego repozytorium.
   - Upewnij się, że przesłał się też plik **`.nojekyll`** (pliki zaczynające się od kropki bywają ukryte – w Eksploratorze Windows włącz *Widok → Pokaż → Ukryte elementy*). Jeśli go brakuje, w repozytorium kliknij *Add file → Create new file*, wpisz nazwę `.nojekyll` i zatwierdź pusty plik.
   - Folder `.github` przez przeglądarkę też bywa pomijany. Nie jest potrzebny do działania strony – to tylko automatyczne sprawdzanie danych.
3. Na dole wpisz opis, np. „Pierwsza wersja”, i kliknij **Commit changes**.

## 3B. Wysłanie plików przez Git (zalecane)

W terminalu (PowerShell / Git Bash / terminal w VS Code), w folderze projektu:

```bash
git init
git add .
git commit -m "Pierwsza wersja INF.04 Trener"
git branch -M main
git remote add origin https://github.com/TWOJ-LOGIN/inf04-trener.git
git push -u origin main
```

Przy pierwszym `git push` pojawi się okno logowania do GitHuba (Git Credential Manager w Windows) – zaloguj się przez przeglądarkę.

> Jeśli Git zgłasza „Please tell me who you are”, ustaw dane autora:
> `git config --global user.name "Imię Nazwisko"` oraz `git config --global user.email "twoj@email.pl"`.

**GitHub Desktop:** *File → Add local repository* → wskaż folder → *Publish repository* (odznacz „Keep this code private”).

---

## 4. Włącz GitHub Pages

1. W repozytorium wejdź w **Settings** (zakładka u góry).
2. W menu po lewej wybierz **Pages**.
3. W sekcji **Build and deployment**:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` oraz folder `/ (root)`
4. Kliknij **Save**.
5. Odczekaj 1–2 minuty i odśwież stronę ustawień. U góry pojawi się adres:

```
https://TWOJ-LOGIN.github.io/inf04-trener/
```

Postęp publikacji widać w zakładce **Actions** (zadanie *pages build and deployment*).

---

## 5. Uzupełnij informacje o projekcie

1. W **README.md** podmień `TWOJ-LOGIN` na swój login.
2. W pliku **LICENSE** wpisz swoje imię i nazwisko (lub pseudonim) w miejscu `[Twoje imię i nazwisko]`.
3. Na stronie głównej repozytorium kliknij ⚙️ obok **About** i:
   - wklej adres strony w polu **Website**,
   - dodaj tematy (**Topics**): `inf04`, `egzamin-zawodowy`, `technik-programista`, `cke`, `edukacja`, `javascript`.

---

## 6. Aktualizacje

Każda zmiana wysłana do gałęzi `main` automatycznie publikuje nową wersję (zwykle w 1–2 minuty):

```bash
git add .
git commit -m "Dodano pytania z działu OOP"
git push
```

Przez przeglądarkę: otwórz plik w repozytorium → ikona ołówka → edycja → **Commit changes**.

> **Wskazówka:** aplikacja ma Service Worker (tryb offline). Jeśli po aktualizacji widzisz starą wersję, odśwież stronę z pominięciem pamięci podręcznej: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (macOS). Przy większych zmianach podnieś też `CACHE_VERSION` w pliku `sw.js`.

---

## 7. Najczęstsze problemy

| Problem | Przyczyna i rozwiązanie |
|---|---|
| Strona pokazuje README zamiast aplikacji / błąd 404 | `index.html` nie leży w katalogu głównym repozytorium (np. wrzuciłeś folder w folderze). Przenieś pliki poziom wyżej. |
| Brak stylów, pusta strona | Ścieżki muszą być **względne** (`./css/...`), a nie od ukośnika (`/css/...`) – strona działa w podkatalogu `/inf04-trener/`. W tym projekcie jest to już zrobione; pilnuj tego przy własnych zmianach. |
| „Nie udało się pobrać ./data/…” | Literówka lub **wielkość liter** w nazwie pliku. Windows ich nie rozróżnia, serwer GitHuba tak (`OOP.json` ≠ `oop.json`). |
| Działa lokalnie z `file://`, ale nie ładuje danych | To normalne – użyj lokalnego serwera (krok 1). Na GitHub Pages działa poprawnie. |
| SQL Lab: „Nie udało się wczytać silnika SQLite” | sql.js ładuje się z CDN `cdn.jsdelivr.net` – potrzebny jest internet przy pierwszym wejściu (potem działa z pamięci podręcznej) i brak blokady CDN w sieci szkolnej. Możesz pobrać `sql-wasm.js` i `sql-wasm.wasm` do `vendor/` i zmienić adresy w `js/config.js`. |
| Strona nie odświeża się po zmianie | Poczekaj 1–2 minuty, sprawdź zakładkę Actions, wymuś odświeżenie `Ctrl+Shift+R`. |
| Postępy zniknęły | Dane są w LocalStorage konkretnej przeglądarki i adresu. Zmiana adresu strony (np. inna nazwa repozytorium) albo wyczyszczenie danych przeglądarki = nowy, pusty profil. Rób kopię: *Ustawienia → Eksportuj postępy*. |

---

## 8. (Opcjonalnie) Własna domena

1. *Settings → Pages → Custom domain* – wpisz domenę, np. `inf04.mojadomena.pl`.
2. U rejestratora domeny dodaj rekord **CNAME** wskazujący na `TWOJ-LOGIN.github.io`.
3. Po weryfikacji zaznacz **Enforce HTTPS**.

## 9. (Opcjonalnie) Automatyczne sprawdzanie treści

Plik `.github/workflows/validate-data.yml` uruchamia `node tools/validate-data.mjs` przy każdym pushu i pull requeście. Jeśli ktoś doda pytanie z błędem (np. zły indeks poprawnej odpowiedzi), zobaczysz czerwony znaczek ✖ w zakładce **Actions** i przy pull requeście.
