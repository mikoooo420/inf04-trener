---
title: Podstawy programowania
---

## Typy danych

| Kategoria | C++ | C# / Java | Python | Uwagi |
|---|---|---|---|---|
| Liczba całkowita | `int`, `long long` | `int`, `long` | `int` | `int` ma zwykle 32 bity: ok. ±2,1 mld |
| Zmiennoprzecinkowa | `float`, `double` | `float`, `double` | `float` | `double` = podwójna precyzja (64 bity) |
| Logiczna | `bool` | `bool` / `boolean` | `bool` | `true`/`false` (`True`/`False` w Pythonie) |
| Znak | `char` | `char` | (brak – napis 1-znakowy) | w C++ `char` ma 1 bajt, w C#/Javie 2 bajty (UTF-16) |
| Napis | `std::string` | `string` / `String` | `str` | w C#, Javie i Pythonie napisy są **niemutowalne** |

**Typowanie statyczne** (C++, C#, Java) – typ zmiennej jest znany w czasie kompilacji. **Typowanie dynamiczne** (Python, JavaScript) – typ wynika z przypisanej wartości w trakcie działania programu.

> [!PULAPKA]
> Przepełnienie typu: w C++/C#/Javie `int` ma ograniczony zakres. `2147483647 + 1` daje liczbę ujemną (w C# i Javie wynik „zawija się”, w C++ to zachowanie niezdefiniowane). Do dużych wartości (np. silnia 20!) użyj `long long` / `long`.

## Zmienne i stałe

- **zmienna** – nazwany obszar pamięci, którego wartość może się zmieniać,
- **stała** – wartość, której nie można zmienić: `const` (C++, C#), `final` (Java), w Pythonie umownie WIELKIE_LITERY,
- **zasięg** – zmienna lokalna istnieje tylko w bloku/funkcji, w której ją zadeklarowano; zmienna globalna jest widoczna w całym pliku/programie.

**Konwencje nazewnictwa:** `camelCase` (zmienne w Javie/JS, parametry w C#), `PascalCase` (klasy, metody i właściwości w C#), `snake_case` (Python), `UPPER_CASE` (stałe).

## Operatory

| Grupa | Operatory |
|---|---|
| Arytmetyczne | `+ - * / %` (`//` i `**` w Pythonie) |
| Porównania | `== != < > <= >=` |
| Logiczne | `&&` `\|\|` `!` (w Pythonie `and or not`) |
| Przypisania | `= += -= *= /= %=` |
| Inkrementacja | `++` `--` (brak w Pythonie) |
| Bitowe | `& \| ^ ~ << >>` |

**Preinkrementacja vs postinkrementacja:** `++i` najpierw zwiększa, potem zwraca wartość; `i++` zwraca starą wartość, a dopiero potem zwiększa.

```cpp
int i = 5;
int a = i++;   // a = 5, i = 6
int b = ++i;   // i = 7, b = 7
```

> [!CKE]
> Pytania „co wypisze program” z `i++` i `++i` to klasyk. Rozpisz wartości zmiennych linijka po linijce. Pamiętaj też o **skróconym wartościowaniu**: w `a && b` jeśli `a` jest fałszem, `b` w ogóle nie jest obliczane.

## Instrukcje sterujące

**Warunkowe:** `if / else if / else`, `switch` (w C++/C#/Javie – pamiętaj o `break`, inaczej wykonanie „przelatuje” do kolejnego `case`), operator trójargumentowy `warunek ? a : b`.

**Pętle:**

| Pętla | Kiedy używać |
|---|---|
| `for` | znana liczba powtórzeń |
| `while` | warunek sprawdzany **przed** obiegiem – może nie wykonać się ani razu |
| `do … while` | warunek sprawdzany **po** obiegu – wykona się **co najmniej raz** |
| `foreach` / `for … in` | przejście po elementach kolekcji |

`break` przerywa pętlę, `continue` przechodzi do następnego obiegu.

> [!PULAPKA]
> Pętla `do { … } while (warunek);` wykona się raz nawet wtedy, gdy warunek od początku jest fałszywy. To częsta odpowiedź w pytaniach „ile razy wykona się pętla”.

## Funkcje i parametry

**Funkcja** to wydzielony, nazwany fragment kodu, który można wywoływać wielokrotnie. Ma **nagłówek** (typ zwracany, nazwę, listę parametrów) i **ciało**. Funkcja niezwracająca wartości ma typ `void`.

**Przeciążanie funkcji** (C++, C#, Java) – kilka funkcji o tej samej nazwie, różniących się **listą parametrów** (liczbą lub typami). Sam typ zwracany nie wystarcza do przeciążenia.

### Przekazywanie parametrów

| Sposób | Co się dzieje | Składnia |
|---|---|---|
| Przez wartość | funkcja dostaje **kopię** – zmiany nie wpływają na oryginał | `void f(int x)` |
| Przez referencję | funkcja działa na **oryginale** | C++: `void f(int& x)`, C#: `void F(ref int x)` |
| Przez wskaźnik (C++) | funkcja dostaje **adres**, przez który może zmienić oryginał | `void f(int* x)` |

```cpp
void zwieksz(int x)  { x++; }   // zmienia kopię
void zwiekszR(int& x){ x++; }   // zmienia oryginał

int a = 1;
zwieksz(a);   // a nadal 1
zwiekszR(a);  // a = 2
```

W C# i Javie obiekty (typy referencyjne) przekazywane są przez wartość **referencji** – metoda może zmienić stan obiektu, ale nie podmieni samej zmiennej wywołującego. W C# słowo `out` służy do zwracania dodatkowych wyników.

## Wskaźniki i pamięć (C++)

- `&x` – **adres** zmiennej `x`,
- `int* p = &x;` – wskaźnik `p` przechowuje adres `x`,
- `*p` – **dereferencja**: wartość spod adresu,
- `new` przydziela pamięć dynamicznie (na stercie), `delete` ją zwalnia; brak `delete` = **wyciek pamięci**,
- `nullptr` – wskaźnik, który nie wskazuje na nic.

**Stos (stack)** przechowuje zmienne lokalne i ramki wywołań, zwalniany automatycznie. **Sterta (heap)** przechowuje dane alokowane dynamicznie. W C#, Javie i Pythonie pamięć sterty zwalnia **garbage collector** (odśmiecacz).

> [!WZOR] Wskaźniki w jednej linijce
> `int x = 5; int* p = &x; *p = 10;` → teraz `x == 10`, bo zmieniliśmy wartość pod adresem `x`.

## Napisy

Najczęstsze operacje: długość (`s.length()` w C++, `s.Length` w C#, `s.length()` w Javie, `len(s)` w Pythonie), dostęp do znaku `s[i]`, wycinanie fragmentu (`substr`, `Substring`, `substring`, `s[a:b]`), zamiana wielkości liter, porównywanie.

> [!PULAPKA]
> W Javie napisy porównujemy metodą `equals()`, a nie `==`. Operator `==` porównuje referencje (czy to ten sam obiekt), a nie treść.
