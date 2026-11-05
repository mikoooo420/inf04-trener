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
