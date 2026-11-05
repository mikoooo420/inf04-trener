---
title: Struktury danych
---

## Po co struktury danych

**Struktura danych** to sposób przechowywania i organizowania danych w pamięci. Wybór struktury decyduje o tym, jak szybko wykonamy podstawowe operacje: dostęp, wyszukiwanie, wstawianie i usuwanie.

| Struktura | Dostęp po indeksie | Wstawienie na początek | Wyszukiwanie |
|---|---|---|---|
| Tablica | O(1) | O(n) | O(n), posortowana: O(log n) |
| Lista jednokierunkowa | O(n) | O(1) | O(n) |
| Tablica mieszająca (słownik) | – | O(1) średnio | O(1) średnio |
| Drzewo BST (zrównoważone) | – | O(log n) | O(log n) |

## Tablica

**Tablica** to ciąg elementów **tego samego typu** zajmujących **ciągły obszar pamięci**. Elementy indeksujemy od **0**, więc ostatni element tablicy `n`-elementowej ma indeks `n - 1`.

- **tablica statyczna** – rozmiar ustalony przy tworzeniu (`int t[10];` w C++, `int[] t = new int[10];` w C#/Javie),
- **tablica dynamiczna** – rozmiar może się zmieniać (`std::vector` w C++, `List<T>` w C#, `ArrayList` w Javie, `list` w Pythonie),
- **tablica dwuwymiarowa** – „tabela” wierszy i kolumn, np. `int m[3][4];`.

> [!PULAPKA]
> Odwołanie do `t[n]` w tablicy `n`-elementowej to wyjście poza zakres. W C# i Javie skończy się wyjątkiem (`IndexOutOfRangeException` / `ArrayIndexOutOfBoundsException`), a w C++ – zachowaniem niezdefiniowanym (program może „działać”, ale czyta śmieci z pamięci).

## Lista

**Lista łączona** składa się z węzłów. Każdy węzeł przechowuje wartość i **wskaźnik/referencję** do następnego węzła (lista jednokierunkowa) albo także do poprzedniego (lista dwukierunkowa). Wstawianie i usuwanie w znanym miejscu jest szybkie, ale dostęp do `k`-tego elementu wymaga przejścia od początku.

```cpp
struct Wezel {
    int wartosc;
    Wezel* nastepny;   // nullptr oznacza koniec listy
};
```

## Stos (LIFO)

**Stos** działa według zasady **LIFO** (*Last In, First Out*) – ostatni włożony element zostaje zdjęty jako pierwszy, jak stos talerzy.

| Operacja | Znaczenie |
|---|---|
| `push` | połóż element na szczycie |
| `pop` | zdejmij element ze szczytu |
| `peek` / `top` | odczytaj szczyt bez zdejmowania |
| `isEmpty` | czy stos jest pusty |

Zastosowania: **stos wywołań funkcji** (rekurencja!), cofanie operacji (Ctrl+Z), sprawdzanie nawiasów, obliczanie wyrażeń w odwrotnej notacji polskiej (ONP).

## Kolejka (FIFO)

**Kolejka** działa według zasady **FIFO** (*First In, First Out*) – pierwszy, który przyszedł, pierwszy wychodzi, jak kolejka w sklepie. Operacje: `enqueue` (dodaj na koniec) i `dequeue` (pobierz z początku).

Zastosowania: kolejka wydruków, obsługa zdarzeń i zadań, przeszukiwanie grafu wszerz (BFS). **Kolejka priorytetowa** wydaje najpierw element o najwyższym priorytecie, a nie najstarszy.

> [!CKE]
> Pytania o stos i kolejkę sprowadzają się do dwóch skrótów: **stos = LIFO**, **kolejka = FIFO**. Czasem pytają, w jakiej kolejności zostaną zdjęte elementy po serii `push`/`pop` – zapisz to sobie na kartce krok po kroku.

## Drzewo

**Drzewo** to struktura hierarchiczna: ma **korzeń**, węzły i **liście** (węzły bez dzieci). W **drzewie binarnym** każdy węzeł ma najwyżej dwoje dzieci.

**Drzewo BST** (*binary search tree*): w lewym poddrzewie są wartości mniejsze od węzła, w prawym – większe. Przejście **in-order** (lewe → węzeł → prawe) daje elementy posortowane rosnąco.

Rodzaje przechodzenia drzewa: **pre-order** (węzeł, lewe, prawe), **in-order** (lewe, węzeł, prawe), **post-order** (lewe, prawe, węzeł).

## Graf

**Graf** to zbiór **wierzchołków** połączonych **krawędziami**. Graf może być skierowany lub nieskierowany, ważony (krawędzie mają wagi, np. odległości) lub nieważony.

Reprezentacje: **macierz sąsiedztwa** (tablica n×n) i **lista sąsiedztwa**. Przeszukiwanie: **BFS** (wszerz, używa kolejki) i **DFS** (w głąb, używa stosu lub rekurencji). Najkrótsze ścieżki w grafie ważonym: algorytm **Dijkstry**.

## Słownik (mapa) i zbiór

**Słownik** przechowuje pary **klucz → wartość**; klucze są unikalne. Najczęściej realizowany jako **tablica mieszająca** (hash table), co daje średnio stały czas dostępu.

| Język | Słownik | Zbiór |
|---|---|---|
| C++ | `std::map`, `std::unordered_map` | `std::set` |
| C# | `Dictionary<K, V>` | `HashSet<T>` |
| Java | `HashMap<K, V>` | `HashSet<T>` |
| Python | `dict` | `set` |

> [!WZOR] Jak wybrać strukturę
> Potrzebujesz dostępu po numerze → **tablica**. Często dodajesz/usuwasz w środku → **lista**. Szukasz po nazwie/kluczu → **słownik**. Cofanie operacji → **stos**. Obsługa w kolejności zgłoszeń → **kolejka**.
