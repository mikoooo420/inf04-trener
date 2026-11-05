---
title: Systemy liczbowe i reprezentacja danych
---

## Systemy pozycyjne

W systemie pozycyjnym wartość cyfry zależy od jej pozycji. Liczba w systemie o podstawie `p` to suma `cyfra · p^pozycja` (pozycje liczymy od 0 od prawej strony).

| System | Podstawa | Cyfry | Oznaczenia |
|---|---|---|---|
| Dwójkowy (BIN) | 2 | 0–1 | `1010₂`, `0b1010` |
| Ósemkowy (OCT) | 8 | 0–7 | `12₈`, `012` (C++), `0o12` (Python) |
| Dziesiętny (DEC) | 10 | 0–9 | `10` |
| Szesnastkowy (HEX) | 16 | 0–9, A–F | `A₁₆`, `0xA`, `#FF0000` (kolory CSS) |

## Zamiana systemów

**Na dziesiętny:** mnożymy cyfry przez potęgi podstawy.
`1011₂ = 1·8 + 0·4 + 1·2 + 1·1 = 11`
`2F₁₆ = 2·16 + 15 = 47`

**Z dziesiętnego:** dzielimy przez podstawę i zapisujemy reszty **od końca**.
`13 : 2 = 6 r 1 → 6 : 2 = 3 r 0 → 3 : 2 = 1 r 1 → 1 : 2 = 0 r 1` → czytamy od dołu: `1101₂`.

**BIN ↔ HEX:** każda cyfra szesnastkowa to dokładnie **4 bity** (tetrada). `1010 1111₂ = AF₁₆`.
**BIN ↔ OCT:** każda cyfra ósemkowa to **3 bity**. `101 111₂ = 57₈`.

> [!WZOR] Tabela do zapamiętania
> `8 = 1000`, `9 = 1001`, `A = 1010`, `B = 1011`, `C = 1100`, `D = 1101`, `E = 1110`, `F = 1111`.
> Potęgi dwójki: 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024.

## Jednostki informacji

**Bit** – najmniejsza jednostka (0 lub 1). **Bajt** = 8 bitów. Na `n` bitach zapiszemy **2ⁿ** różnych wartości, np. na 8 bitach 256 wartości (0–255 bez znaku).

| Przedrostek dziesiętny (SI) | Przedrostek binarny (IEC) |
|---|---|
| 1 kB = 1000 B | 1 KiB = 1024 B |
| 1 MB = 1000 kB | 1 MiB = 1024 KiB |
| 1 GB = 1000 MB | 1 GiB = 1024 MiB |

## Liczby ujemne – kod U2

W **kodzie uzupełnień do dwóch (U2)** najstarszy bit ma wagę **ujemną**. Na 8 bitach zakres to **od −128 do 127**.

Jak zapisać liczbę ujemną w U2: zapisz wartość bezwzględną binarnie → **zaneguj wszystkie bity** → **dodaj 1**.

`−5` na 8 bitach: `00000101` → `11111010` → `11111011`.

Sprawdzenie: `11111011 = −128 + 64 + 32 + 16 + 8 + 2 + 1 = −5`.

Inne kody: **ZM** (znak-moduł – pierwszy bit to znak, ma dwa zera: +0 i −0) oraz **U1** (negacja bitów, również dwa zera). Komputery używają U2, bo ma jedno zero i proste dodawanie.

> [!CKE]
> Najczęstsze pytania: zamiana między systemami, zakres liczb na `n` bitach (bez znaku: `0 … 2ⁿ − 1`, w U2: `−2ⁿ⁻¹ … 2ⁿ⁻¹ − 1`) oraz zapis liczby ujemnej w U2.

## Liczby zmiennoprzecinkowe

Standard **IEEE 754**: liczba zapisana jako **znak**, **wykładnik** (cecha) i **mantysa**. `float` ma 32 bity (ok. 7 cyfr znaczących), `double` – 64 bity (ok. 15–16 cyfr).

> [!PULAPKA]
> Wiele ułamków dziesiętnych (np. 0,1) nie ma dokładnej reprezentacji binarnej. Dlatego `0.1 + 0.2 == 0.3` daje **false**. Liczby zmiennoprzecinkowe porównujemy z tolerancją: `abs(a - b) < 1e-9`. Do kwot pieniężnych używa się typów dziesiętnych (`decimal` w C#, `BigDecimal` w Javie).

## Kodowanie znaków

| Kodowanie | Opis |
|---|---|
| **ASCII** | 7 bitów, 128 znaków: litery łacińskie, cyfry, znaki sterujące. `'A' = 65`, `'a' = 97`, `'0' = 48` |
| **ISO 8859-2** / **Windows-1250** | 8-bitowe strony kodowe z polskimi znakami (starsze rozwiązania) |
| **Unicode** | uniwersalny standard – każdy znak ma unikalny numer (punkt kodowy), np. `U+0105` = „ą” |
| **UTF-8** | kodowanie Unicode o zmiennej długości 1–4 bajtów; zgodne z ASCII; standard w sieci |
| **UTF-16** | 2 lub 4 bajty na znak; wewnętrzne kodowanie napisów w C#, Javie i JavaScript |

> [!INFO]
> Różnica między małą i wielką literą w ASCII to 32 (`'a' − 'A' = 32`). Dzięki temu zamiana wielkości liter i szyfr Cezara sprowadzają się do arytmetyki na kodach znaków.

## Operacje bitowe

| Operator | Działanie | Przykład (`a = 1100₂`, `b = 1010₂`) |
|---|---|---|
| `&` (AND) | 1, gdy oba bity to 1 | `1000₂` |
| `\|` (OR) | 1, gdy choć jeden bit to 1 | `1110₂` |
| `^` (XOR) | 1, gdy bity są różne | `0110₂` |
| `~` (NOT) | negacja bitów | |
| `<<` | przesunięcie w lewo = mnożenie przez 2 | `0011 << 1 = 0110` |
| `>>` | przesunięcie w prawo = dzielenie całkowite przez 2 | `0110 >> 1 = 0011` |

Sprawdzanie parzystości bitowo: `(x & 1) == 0` oznacza liczbę parzystą.
