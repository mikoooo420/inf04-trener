---
title: Aplikacje webowe i frameworki
---

## Jak działa aplikacja webowa

Przeglądarka (**klient**) wysyła żądanie **HTTP** do **serwera**, który zwraca odpowiedź (HTML, CSS, JS, JSON, obrazy). **Frontend** to część działająca w przeglądarce (HTML, CSS, JavaScript), **backend** – logika na serwerze (np. PHP, Node.js, C# ASP.NET, Java Spring, Python Django/Flask) i baza danych.

- **HTML** – struktura i treść strony,
- **CSS** – wygląd (kolory, układ, typografia),
- **JavaScript** – zachowanie (reakcja na zdarzenia, modyfikacja strony, komunikacja z serwerem).

## DOM i obsługa zdarzeń w JavaScript

**DOM** (*Document Object Model*) to drzewiasta reprezentacja dokumentu HTML, którą JavaScript może odczytywać i modyfikować.

```html
<input type="number" id="liczba">
<button id="oblicz">Oblicz</button>
<p id="wynik"></p>

<script>
  document.getElementById('oblicz').addEventListener('click', () => {
    const n = Number(document.getElementById('liczba').value);
    document.getElementById('wynik').textContent = `Kwadrat: ${n * n}`;
  });
</script>
```

| Metoda / właściwość | Opis |
|---|---|
| `document.getElementById('id')` | element o danym `id` |
| `document.querySelector('.klasa')` | pierwszy element pasujący do selektora CSS |
| `document.querySelectorAll('li')` | wszystkie pasujące elementy |
| `el.textContent` / `el.innerHTML` | tekst / kod HTML wewnątrz elementu |
| `input.value` | wartość pola formularza (zawsze **napis**!) |
| `el.style.color = 'red'` | zmiana stylu |
| `el.classList.add('aktywny')` | dodanie klasy CSS |
| `addEventListener('click', fn)` | podpięcie obsługi zdarzenia |

> [!PULAPKA]
> `input.value` zwraca **napis**. `"2" + "3"` daje `"23"`, a nie 5. Zamień tekst na liczbę: `Number()`, `parseInt()` lub `parseFloat()`. W JS porównuj przez `===` (bez konwersji typów), nie `==`.

## Podstawy JavaScript

- deklaracje zmiennych: `let` (zmienna o zasięgu blokowym), `const` (stała referencja), przestarzałe `var`,
- funkcje strzałkowe: `const kwadrat = x => x * x;`,
- tablice: `push`, `pop`, `map`, `filter`, `reduce`, `forEach`, `find`, `sort`,
- obiekty: `{ imie: 'Ala', wiek: 17 }`, klasy: `class Osoba { constructor(imie) { this.imie = imie; } }`,
- asynchroniczność: **Promise**, `async/await`, `fetch()` do pobierania danych z API.

```javascript
async function pobierzUzytkownikow() {
  const odp = await fetch('https://api.example.com/users');
  if (!odp.ok) throw new Error('Błąd HTTP ' + odp.status);
  const dane = await odp.json();
  console.log(dane);
}
```

## SPA i frameworki frontendowe

**SPA** (*Single Page Application*) – aplikacja na jednej stronie HTML; zawartość zmienia się dynamicznie bez przeładowania, a routing obsługuje JavaScript.

| Framework | Język | Cechy |
|---|---|---|
| **React** | JavaScript/JSX (Meta) | biblioteka komponentów, **wirtualny DOM**, jednokierunkowy przepływ danych, hooki (`useState`, `useEffect`) |
| **Angular** | **TypeScript** (Google) | kompletny framework, komponenty + szablony HTML, **dwukierunkowe wiązanie danych**, wstrzykiwanie zależności, Angular CLI |
| **Vue.js** | JavaScript | progresywny framework, reaktywność, komponenty jednoplikowe `.vue` |

```jsx
// React – komponent z licznikiem
function Licznik() {
  const [ile, setIle] = useState(0);
  return <button onClick={() => setIle(ile + 1)}>Kliknięto {ile} razy</button>;
}
```

Pojęcia: **komponent** (samodzielny fragment interfejsu), **props** (dane przekazane do komponentu z zewnątrz, tylko do odczytu), **state** (stan wewnętrzny komponentu), **data binding** (wiązanie danych z widokiem), **dyrektywy** w Angularze (`*ngFor`, `*ngIf`) i Vue (`v-for`, `v-if`, `v-model`).

> [!CKE]
> W części praktycznej aplikację z interfejsem można często wykonać jako **aplikację webową** (np. React/Angular albo czysty HTML+JS). Typowe zadanie: formularz z polami, przycisk, walidacja danych i wyświetlenie wyniku w wyznaczonym elemencie.

## React w praktyce

Komponent React to **funkcja zwracająca JSX** (HTML-podobną składnię w JavaScripcie). Najważniejsze hooki:

| Hook | Do czego |
|---|---|
| `useState(początkowa)` | stan komponentu → `[wartość, setWartość]`; zmiana stanu **odświeża widok** |
| `useEffect(() => {…}, [zależności])` | efekty uboczne: pobranie danych, timer, subskrypcja |
| `useRef()` | referencja do elementu DOM lub wartość niewywołująca odświeżenia |

```jsx
import { useState } from 'react';

export default function Formularz() {
  const [imie, setImie] = useState('');
  const [wynik, setWynik] = useState('');

  return (
    <div>
      <input value={imie} onChange={(e) => setImie(e.target.value)} />
      <button onClick={() => setWynik(`Cześć, ${imie}!`)}>Powitaj</button>
      {wynik && <p>{wynik}</p>}
      <ul>{['a', 'b'].map((x) => <li key={x}>{x}</li>)}</ul>
    </div>
  );
}
```

- JSX: `className` zamiast `class`, `htmlFor` zamiast `for`, zdarzenia w camelCase (`onClick`, `onChange`), wyrażenia w `{ }`,
- **pole kontrolowane** = `value` ze stanu + `onChange` aktualizujący stan,
- listy renderujemy przez `map()`, a każdy element dostaje unikalny `key`,
- **props** przekazuje rodzic: `<Powitanie imie="Ala" />` → `function Powitanie({ imie }) { … }`.

> [!PULAPKA]
> Stanu nie zmieniamy bezpośrednio (`licznik++` nic nie odświeży) – zawsze przez funkcję `setLicznik(…)`. Nie modyfikuj też DOM ręcznie (`document.getElementById`) – od tego jest React.

## Angular w praktyce

Komponent Angulara = **klasa TypeScript** z dekoratorem `@Component` + **szablon HTML**. Projekt tworzy i uruchamia **Angular CLI**: `ng new app`, `ng serve`, `ng generate component nazwa`.

```typescript
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  imie = '';
  powitanie = '';
  powitaj(): void { this.powitanie = `Cześć, ${this.imie}!`; }
}
```

| Składnia w szablonie | Znaczenie |
|---|---|
| `{{ wyrazenie }}` | interpolacja (klasa → widok) |
| `[wlasciwosc]="wyr"` | wiązanie właściwości, np. `[disabled]="!zgoda"` |
| `(zdarzenie)="metoda()"` | wiązanie zdarzenia, np. `(click)="powitaj()"` |
| `[(ngModel)]="pole"` | **dwukierunkowe** wiązanie (wymaga `FormsModule`) |
| `@if (warunek) { … }` / `*ngIf` | warunkowe wyświetlanie |
| `@for (x of lista; track x.id) { … }` / `*ngFor` | pętla |

Usługi (`@Injectable`) wstrzykuje się przez konstruktor – to **wstrzykiwanie zależności** (*Dependency Injection*).

## TypeScript

**TypeScript** (Microsoft) to JavaScript z **statycznym typowaniem**. Przeglądarka go nie rozumie – kompilator `tsc` zamienia `.ts` na `.js` i przy okazji wykrywa błędy typów **przed uruchomieniem**.

```typescript
let wiek: number = 17;
const imiona: string[] = ['Ala', 'Ola'];
let id: number | string = 5;          // typ unii

interface Uczen {
  imie: string;
  oceny: number[];
  klasa?: string;                     // pole opcjonalne
}

function srednia(u: Uczen): number {
  return u.oceny.reduce((a, b) => a + b, 0) / u.oceny.length;
}

class Konto {
  constructor(private saldo: number) {}
  wplac(kwota: number): void { this.saldo += kwota; }
}
```

- typy podstawowe: `number`, `string`, `boolean`, tablice `T[]`, `any` (wyłącza sprawdzanie), `unknown`, `void`, `null`/`undefined`,
- `interface` i `type` opisują kształt obiektu, **generyki** (`Array<T>`, `Promise<T>`) pozwalają pisać kod dla wielu typów,
- modyfikatory dostępu w klasach: `public`, `private`, `protected`, `readonly`,
- `strict` w `tsconfig.json` włącza najostrzejsze sprawdzanie (m.in. `null` musi być obsłużony jawnie).

> [!CKE]
> Angular jest pisany w TypeScripcie, a React często w TSX (TypeScript + JSX). Zadania TS przećwiczysz w **Code Lab**, a komponenty React/Angular w **Pracowni GUI**.

## Node.js i Express

**Node.js** – środowisko uruchomieniowe JavaScriptu **poza przeglądarką** (silnik V8). Służy do pisania serwerów, narzędzi CLI i skryptów. Pakiety instaluje **npm**: `npm init -y`, `npm install express`; zależności zapisują się w `package.json`, a kod bibliotek w `node_modules`.

```javascript
// Moduły (CommonJS)
const fs = require('fs');
const dane = fs.readFileSync('dane.txt', 'utf8');
fs.writeFileSync('wynik.txt', dane.toUpperCase());
console.log(process.argv[2]);         // argument z wiersza poleceń
module.exports = { funkcja };         // eksport z modułu
```

**Express** – minimalistyczny framework do budowy serwerów HTTP i REST API:

```javascript
const express = require('express');
const app = express();
app.use(express.json());              // parsowanie JSON z body

const uczniowie = [{ id: 1, imie: 'Ala' }];

app.get('/api/uczniowie', (req, res) => res.json(uczniowie));

app.get('/api/uczniowie/:id', (req, res) => {
  const u = uczniowie.find((x) => x.id === Number(req.params.id));
  if (!u) return res.status(404).json({ blad: 'Nie znaleziono' });
  res.json(u);
});

app.post('/api/uczniowie', (req, res) => {
  const nowy = { id: uczniowie.length + 1, ...req.body };
  uczniowie.push(nowy);
  res.status(201).json(nowy);
});

app.listen(3000, () => console.log('Serwer na http://localhost:3000'));
```

| Element | Znaczenie |
|---|---|
| `req.params` | parametry ścieżki (`/:id`) |
| `req.query` | parametry zapytania (`?strona=2`) |
| `req.body` | treść żądania (po `express.json()`) |
| `res.json()` / `res.send()` | odpowiedź |
| `res.status(kod)` | kod HTTP odpowiedzi |
| `app.use()` | **middleware** – funkcja wykonywana dla każdego żądania |

> [!PULAPKA]
> Parametry z `req.params` i `req.query` są **napisami** – przed porównaniem z liczbą użyj `Number(...)`. Bez `app.use(express.json())` pole `req.body` będzie puste.

## HTTP i REST

**HTTP** – bezstanowy protokół żądanie–odpowiedź. **HTTPS** = HTTP + szyfrowanie TLS (port **443**, HTTP – port **80**).

| Metoda | Zastosowanie w REST |
|---|---|
| `GET` | pobranie zasobu |
| `POST` | utworzenie nowego zasobu |
| `PUT` | zastąpienie (aktualizacja) całego zasobu |
| `PATCH` | częściowa aktualizacja |
| `DELETE` | usunięcie zasobu |

| Kod | Znaczenie |
|---|---|
| **2xx** – sukces | `200 OK`, `201 Created`, `204 No Content` |
| **3xx** – przekierowanie | `301 Moved Permanently`, `304 Not Modified` |
| **4xx** – błąd klienta | `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| **5xx** – błąd serwera | `500 Internal Server Error`, `503 Service Unavailable` |

**REST API** – styl architektury: zasoby identyfikowane adresami URL (np. `/api/uczniowie/5`), operacje przez metody HTTP, dane najczęściej w formacie **JSON**, komunikacja bezstanowa.

## JSON

**JSON** (*JavaScript Object Notation*) – tekstowy format wymiany danych: obiekty `{ }` z parami `"klucz": wartość`, tablice `[ ]`, napisy w **podwójnych** cudzysłowach, liczby, `true`/`false`, `null`.

```json
{ "imie": "Ala", "wiek": 17, "oceny": [5, 4, 6], "aktywny": true }
```

W JS: `JSON.parse(tekst)` → obiekt, `JSON.stringify(obiekt)` → tekst.

> [!INFO]
> **CORS** – mechanizm przeglądarki blokujący żądania do innej domeny, jeśli serwer na to nie zezwala nagłówkami. **Cookies**, **localStorage** i **sessionStorage** pozwalają przechowywać dane po stronie klienta (ta aplikacja zapisuje Twoje postępy właśnie w localStorage).
