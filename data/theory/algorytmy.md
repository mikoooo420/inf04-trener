---
title: Algorytmy i złożoność
---

## Czym jest algorytm

**Algorytm** to skończony, uporządkowany ciąg jednoznacznych kroków, który dla poprawnych danych wejściowych prowadzi do wyniku. Cechy dobrego algorytmu: **poprawność**, **skończoność** (kończy się po skończonej liczbie kroków), **jednoznaczność** (każdy krok jest precyzyjny) i **efektywność**.

Sposoby zapisu algorytmu:

| Sposób | Opis |
|---|---|
| Opis słowny | lista kroków w języku naturalnym |
| Lista kroków | numerowane instrukcje, np. `K1: wczytaj n` |
| Schemat blokowy | graficzny zapis z blokami o ustalonych kształtach |
| Pseudokod | zapis „prawie programu”, niezależny od języka |
| Program | implementacja w konkretnym języku programowania |

### Bloki schematu blokowego

| Kształt | Znaczenie |
|---|---|
| Owal (elipsa) | **START** / **STOP** |
| Równoległobok | **wejście/wyjście** (wczytaj, wypisz) |
| Prostokąt | **operacja** (przypisanie, obliczenie) |
| Romb | **decyzja/warunek** – dwa wyjścia: TAK / NIE |
| Koło (łącznik) | połączenie fragmentów schematu |

> [!CKE]
> Pytania o schematy blokowe to pewniak. Zapamiętaj: **romb = warunek**, **równoległobok = wejście/wyjście**, **prostokąt = operacja**. Często pytają też, ile razy wykona się pętla narysowana na schemacie – prześledź ją „na kartce” dla małych danych.

## Złożoność obliczeniowa

**Złożoność czasowa** opisuje, jak rośnie liczba operacji wraz z rozmiarem danych `n`. **Złożoność pamięciowa** – jak rośnie zużycie pamięci. Zapisujemy ją w notacji **O (dużego O)**, pomijając stałe i składniki niższego rzędu.

| Złożoność | Nazwa | Przykład |
|---|---|---|
| O(1) | stała | dostęp do elementu tablicy po indeksie |
| O(log n) | logarytmiczna | wyszukiwanie binarne |
| O(n) | liniowa | wyszukiwanie liniowe, suma elementów |
| O(n log n) | liniowo-logarytmiczna | sortowanie przez scalanie, quicksort (średnio) |
| O(n²) | kwadratowa | sortowanie bąbelkowe, dwie zagnieżdżone pętle |
| O(2ⁿ) | wykładnicza | naiwny rekurencyjny Fibonacci |

> [!WZOR] Szybka reguła
> Jedna pętla po `n` elementach → **O(n)**. Pętla w pętli (obie do `n`) → **O(n²)**. Dzielenie problemu na pół w każdym kroku → **O(log n)**.

## Wyszukiwanie

**Wyszukiwanie liniowe** – przeglądamy elementy po kolei, aż znajdziemy szukany. Działa na **dowolnej** tablicy, złożoność **O(n)**.

**Wyszukiwanie z wartownikiem** – na końcu tablicy dopisujemy szukaną wartość (wartownika). Dzięki temu w pętli nie trzeba sprawdzać, czy nie wyszliśmy poza zakres – pętla zawsze się zatrzyma. Jeśli zatrzymała się na wartowniku, elementu nie ma.

```cpp
int szukaj(int tab[], int n, int x) {   // tab ma miejsce na n+1 elementów
    tab[n] = x;                          // wartownik
    int i = 0;
    while (tab[i] != x) i++;
    return (i < n) ? i : -1;             // -1 = nie znaleziono
}
```

**Wyszukiwanie binarne (połówkowe)** – działa **tylko na posortowanej tablicy**. Porównujemy szukaną wartość ze środkiem przedziału i odrzucamy połowę, w której jej na pewno nie ma. Złożoność **O(log n)** – dla miliona elementów wystarczy ok. 20 porównań.

```python
def szukaj_binarnie(tab, x):
    lewy, prawy = 0, len(tab) - 1
    while lewy <= prawy:
        srodek = (lewy + prawy) // 2
        if tab[srodek] == x:
            return srodek
        if tab[srodek] < x:
            lewy = srodek + 1
        else:
            prawy = srodek - 1
    return -1
```

> [!PULAPKA]
> Wyszukiwanie binarne na **nieposortowanej** tablicy daje błędne wyniki. Jeśli w pytaniu pada „tablica nieuporządkowana”, odpowiedź z wyszukiwaniem binarnym jest zła.

## Sortowanie

| Algorytm | Idea | Złożoność (średnio / najgorzej) |
|---|---|---|
| Bąbelkowe | porównuje sąsiadów i zamienia; największe „wypływa” na koniec | O(n²) / O(n²) |
| Przez wybieranie (selection) | szuka minimum w nieposortowanej części i wstawia na początek | O(n²) / O(n²) |
| Przez wstawianie (insertion) | bierze kolejny element i wstawia w dobre miejsce posortowanej części | O(n²) / O(n²), ale O(n) dla prawie posortowanych |
| Przez scalanie (merge sort) | dziel na połowy, sortuj rekurencyjnie, scalaj | O(n log n) / O(n log n) |
| Szybkie (quicksort) | wybierz pivot, podziel na mniejsze i większe, rekurencja | O(n log n) / O(n²) |
| Przez zliczanie (counting) | zlicza wystąpienia wartości z małego zakresu | O(n + k) |

```cpp
// Sortowanie bąbelkowe – rosnąco
void sortuj(int tab[], int n) {
    for (int i = 0; i < n - 1; i++)
        for (int j = 0; j < n - 1 - i; j++)
            if (tab[j] > tab[j + 1])
                swap(tab[j], tab[j + 1]);
}
```

> [!CKE]
> Na egzaminie praktycznym często trzeba **samodzielnie zaimplementować** sortowanie (bez `sort()` z biblioteki), np. „posortuj malejąco metodą przez wybieranie”. Zmiana kierunku sortowania = zmiana znaku porównania `>` na `<`.

## Rekurencja

**Rekurencja** to wywołanie funkcji przez samą siebie. Każda funkcja rekurencyjna musi mieć **warunek zakończenia** (przypadek bazowy) – bez niego dojdzie do przepełnienia stosu (*stack overflow*).

```javascript
function silnia(n) {
  if (n <= 1) return 1;         // przypadek bazowy
  return n * silnia(n - 1);     // wywołanie rekurencyjne
}
```

Każde wywołanie odkłada ramkę na **stosie wywołań**. Dlatego rekurencja zużywa więcej pamięci niż pętla (iteracja). Naiwny rekurencyjny Fibonacci liczy te same wartości wiele razy – ma złożoność wykładniczą. Wersja iteracyjna działa w O(n).

> [!PULAPKA]
> Pytanie „co zwróci funkcja dla argumentu 0 lub ujemnego?” – sprawdź, czy warunek bazowy w ogóle obejmuje taki przypadek. `if (n == 1)` dla `n = 0` oznacza nieskończoną rekurencję.

## Klasyczne algorytmy z arkuszy

**NWD – algorytm Euklidesa** (wersja z resztą z dzielenia):

```cpp
int nwd(int a, int b) {
    while (b != 0) {
        int r = a % b;
        a = b;
        b = r;
    }
    return a;
}
// NWW(a, b) = a * b / NWD(a, b)
```

**Liczba pierwsza** – większa od 1, dzieli się tylko przez 1 i samą siebie. Wystarczy sprawdzać dzielniki do **√n**.

**Sito Eratostenesa** – wypisuje wszystkie liczby pierwsze do `n`: zaczynamy od 2 i wykreślamy wszystkie wielokrotności każdej kolejnej niewykreślonej liczby.

**Liczba doskonała** – równa sumie swoich dzielników właściwych (mniejszych od niej), np. 6 = 1 + 2 + 3, 28 = 1 + 2 + 4 + 7 + 14.

**Palindrom** – tekst czytany od tyłu jest taki sam (np. „kajak”). Porównujemy znaki `i` oraz `n-1-i`.

**Szyfr Cezara** – każdą literę przesuwamy o stałą liczbę pozycji w alfabecie, z „zawinięciem” (`(kod - 'a' + klucz) % 26`). Deszyfrowanie to przesunięcie o `26 - klucz`, więc obie operacje może wykonać jedna metoda pomocnicza.

```cpp
char przesun(char c, int klucz) {            // klucz z zakresu 0–25
    if (c >= 'a' && c <= 'z') return 'a' + (c - 'a' + klucz) % 26;
    if (c >= 'A' && c <= 'Z') return 'A' + (c - 'A' + klucz) % 26;
    return c;                                // inne znaki bez zmian
}
```

> [!WZOR] Operatory, które musisz znać
> `%` – reszta z dzielenia (parzystość: `x % 2 == 0`), `/` na liczbach całkowitych w C++/C#/Java **obcina część ułamkową** (`7 / 2 == 3`), w Pythonie `//` to dzielenie całkowite, a `/` zawsze daje liczbę zmiennoprzecinkową.

> [!PULAPKA] Reszta z dzielenia liczby ujemnej
> W C++, C#, Javie i JavaScripcie wynik `%` ma **znak dzielnej**: `-1 % 26 == -1`, `-27 % 26 == -1`. W Pythonie wynik ma znak dzielnika: `-1 % 26 == 25`. Żeby sprowadzić dowolną liczbę (np. ujemny klucz szyfru) do zakresu `0 … n-1` w każdym języku, użyj wzoru `((k % n) + n) % n` – dla `k = -1`, `n = 26` daje 25, dla `k = 29` daje 3.
