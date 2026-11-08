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

**Operatory specyficzne dla Pythona:** `//` – dzielenie całkowite (`7 // 2 == 3`), `**` – **potęgowanie** (`2 ** 3 == 8`, `9 ** 0.5 == 3.0`). W C++, C# i Javie nie ma operatora potęgi – używa się funkcji `pow(2, 3)` (C++), `Math.Pow(2, 3)` (C#), `Math.pow(2, 3)` (Java); w JavaScripcie działa zarówno `2 ** 3`, jak i `Math.pow(2, 3)`.

> [!PULAPKA]
> `^` w C++, C#, Javie, JS i Pythonie to **XOR bitowy**, a nie potęga: `2 ^ 3 == 1`. Potęga to `**` (Python, JS) albo funkcja `pow`.

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

| Operacja | C++ | C# | Java | Python | JavaScript |
|---|---|---|---|---|---|
| Czy zawiera „@” | `s.find("@") != string::npos` | `s.Contains("@")` | `s.contains("@")` | `"@" in s` | `s.includes("@")` |
| Podział po przecinkach | `getline(strumien, czesc, ',')` | `s.Split(',')` | `s.split(",")` | `s.split(",")` | `s.split(",")` |
| Usunięcie spacji z brzegów | (ręcznie lub pętla) | `s.Trim()` | `s.trim()` | `s.strip()` | `s.trim()` |
| Napis → liczba całkowita | `stoi(s)` | `int.Parse(s)` / `int.TryParse(s, out n)` | `Integer.parseInt(s)` | `int(s)` | `Number(s)` / `parseInt(s)` |
| Wielkie / małe litery | `toupper(c)` / `tolower(c)` | `s.ToUpper()` / `s.ToLower()` | `s.toUpperCase()` / `s.toLowerCase()` | `s.upper()` / `s.lower()` | `s.toUpperCase()` / `s.toLowerCase()` |

Podział zwraca **tablicę napisów**: `"5,4,6".split(",")` → `["5", "4", "6"]`. Każdy element trzeba jeszcze zamienić na liczbę.

## Wejście i wyjście w konsoli

Prawie każda aplikacja konsolowa z arkusza zaczyna się od komunikatu i wczytania danych z klawiatury.

| Operacja | C++ | C# | Java | Python |
|---|---|---|---|---|
| Wypisanie z nową linią | `cout << x << endl;` | `Console.WriteLine(x);` | `System.out.println(x);` | `print(x)` |
| Wypisanie bez nowej linii | `cout << x;` | `Console.Write(x);` | `System.out.print(x);` | `print(x, end="")` |
| Wczytanie liczby całkowitej | `cin >> n;` | `int n = int.Parse(Console.ReadLine());` | `int n = sc.nextInt();` | `n = int(input())` |
| Wczytanie całej linii (ze spacjami) | `getline(cin, s);` | `string s = Console.ReadLine();` | `String s = sc.nextLine();` | `s = input()` |
| Wczytanie jednego znaku | `char c; cin >> c;` | `char c = Console.ReadLine()[0];` | `char c = sc.next().charAt(0);` | `c = input()[0]` |

W Javie najpierw tworzy się skaner: `Scanner sc = new Scanner(System.in);` (`import java.util.Scanner;`). W Pythonie `input("Podaj liczbę: ")` od razu wypisuje komunikat.

```cpp
int n;
do {
    cout << "Podaj liczbę z przedziału 3-10: ";
    cin >> n;
} while (n < 3 || n > 10);      // pytanie powtarzane do skutku
```

> [!PULAPKA]
> `cin >> n` (C++) i `sc.nextInt()` (Java) zostawiają w buforze znak nowej linii. Następne `getline(cin, s)` / `sc.nextLine()` wczyta wtedy **pusty napis**. Wczytuj najpierw linię tekstu, a potem liczbę albo „zjedz” resztę linii (`cin.ignore();` / dodatkowe `sc.nextLine();`). `cin >> s` wczytuje tylko jedno słowo – tekst ze spacjami wymaga `getline`.

## Liczby losowe

| Język | Przygotowanie | Liczba z zakresu **1–100** (oba końce włącznie) |
|---|---|---|
| C++ | `#include <cstdlib>`, `#include <ctime>`, raz na starcie `srand(time(nullptr));` | `rand() % 100 + 1` |
| C# | `Random rnd = new Random();` | `rnd.Next(1, 101)` – górna granica **nie** wchodzi do zakresu |
| Java | `import java.util.Random;`, `Random rnd = new Random();` | `rnd.nextInt(100) + 1` – `nextInt(n)` daje 0…n−1 |
| Python | `import random` | `random.randint(1, 100)` – **oba** końce włącznie |
| JavaScript | – | `Math.floor(Math.random() * 100) + 1` |

> [!WZOR] Zakres od a do b
> C++: `rand() % (b - a + 1) + a`. Kostka do gry (1–6): `rand() % 6 + 1`, `rnd.Next(1, 7)`, `rnd.nextInt(6) + 1`, `random.randint(1, 6)`.

> [!PULAPKA]
> Bez `srand(time(nullptr))` program w C++ przy każdym uruchomieniu losuje **te same** liczby. `srand` wywołuj raz, na początku `main`, a nie przed każdym losowaniem.

## Formatowanie liczb

Typowe polecenie: „wypisz średnią z dokładnością do dwóch miejsc po przecinku”.

| Język | Dwa miejsca po przecinku |
|---|---|
| C++ | `#include <iomanip>`, `cout << fixed << setprecision(2) << x;` |
| C# | `Console.WriteLine($"{x:F2}");` albo `x.ToString("F2")` |
| Java | `System.out.printf("%.2f%n", x);` albo `String.format("%.2f", x)` |
| Python | `print(f"{x:.2f}")` albo `format(x, ".2f")` |
| JavaScript | `x.toFixed(2)` (zwraca napis) |

> [!PULAPKA]
> Bez `fixed` samo `setprecision(2)` w C++ oznacza dwie **cyfry znaczące** (`3.666` → `3.7`). W C# i Javie wynik zależy od ustawień regionalnych: na polskim systemie zobaczysz przecinek (`3,67`). Jeśli polecenie wymaga kropki, użyj `CultureInfo.InvariantCulture` (C#) lub `String.format(Locale.US, "%.2f", x)` (Java).
