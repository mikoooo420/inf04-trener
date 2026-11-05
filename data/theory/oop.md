---
title: Programowanie obiektowe
---

## Klasa i obiekt

**Klasa** to szablon (projekt) opisujący **pola** (dane, atrybuty) i **metody** (zachowania). **Obiekt** to konkretny egzemplarz (instancja) klasy, utworzony w pamięci.

```csharp
class Osoba
{
    private string imie;          // pole
    private int wiek;

    public Osoba(string imie, int wiek)   // konstruktor
    {
        this.imie = imie;
        this.wiek = wiek;
    }

    public void Przedstaw()               // metoda
    {
        Console.WriteLine($"Jestem {imie}, mam {wiek} lat.");
    }
}

Osoba o = new Osoba("Ala", 17);   // utworzenie obiektu (instancji)
o.Przedstaw();
```

Cztery filary programowania obiektowego: **hermetyzacja**, **dziedziczenie**, **polimorfizm**, **abstrakcja**.

## Konstruktor i destruktor

**Konstruktor** to specjalna metoda wywoływana automatycznie przy tworzeniu obiektu. Ma **taką samą nazwę jak klasa** i **nie ma typu zwracanego** (nawet `void`). Służy do inicjalizacji pól.

- **konstruktor domyślny** – bezparametrowy; kompilator tworzy go sam, jeśli nie zdefiniujesz żadnego konstruktora,
- **konstruktor parametryczny** – przyjmuje wartości początkowe,
- **konstruktor kopiujący** (C++) – tworzy obiekt jako kopię innego: `Osoba(const Osoba& inna)`,
- klasa może mieć kilka konstruktorów (przeciążanie).

**Destruktor** (C++: `~Osoba()`) wywoływany jest przy niszczeniu obiektu – zwalnia zasoby. W C# i Javie pamięć zwalnia garbage collector, a zasoby (pliki, połączenia) zamyka się przez `using` / `try-with-resources`.

> [!CKE]
> „Metoda o nazwie takiej jak klasa, bez typu zwracanego” = **konstruktor**. „Metoda z tyldą `~`” = **destruktor** (C++). To jedne z najczęstszych pytań z OOP.

## Hermetyzacja (enkapsulacja)

**Hermetyzacja** to ukrywanie wewnętrznego stanu obiektu i udostępnianie go tylko przez kontrolowany interfejs (metody, akcesory). Chroni dane przed niepoprawną modyfikacją.

| Modyfikator | Dostęp |
|---|---|
| `private` | tylko wewnątrz tej samej klasy |
| `protected` | w klasie i w klasach pochodnych |
| `public` | z dowolnego miejsca |
| `internal` (C#) | w obrębie tego samego projektu (assembly) |
| domyślny (Java, brak słowa) | w obrębie tego samego pakietu |

W C++ składowe klasy (`class`) są domyślnie **prywatne**, a struktury (`struct`) – **publiczne**.

**Akcesory:** getter zwraca wartość pola, setter ją ustawia (może sprawdzić poprawność). W C# zamiast tego używa się **właściwości**:

```csharp
public int Wiek
{
    get { return wiek; }
    set { if (value >= 0) wiek = value; }
}
```

## Dziedziczenie

**Dziedziczenie** pozwala utworzyć **klasę pochodną** (potomną) na bazie **klasy bazowej** (nadrzędnej). Klasa pochodna przejmuje pola i metody bazowej i może dodawać własne lub je nadpisywać.

| Język | Składnia | Wywołanie konstruktora bazowego |
|---|---|---|
| C++ | `class Uczen : public Osoba` | `Uczen(...) : Osoba(imie, wiek)` |
| C# | `class Uczen : Osoba` | `public Uczen(...) : base(imie, wiek)` |
| Java | `class Uczen extends Osoba` | `super(imie, wiek);` |
| Python | `class Uczen(Osoba):` | `super().__init__(imie, wiek)` |

C++ i Python pozwalają na **dziedziczenie wielokrotne** klas. C# i Java – nie; klasa może dziedziczyć po jednej klasie, ale implementować wiele **interfejsów**.

> [!PULAPKA]
> Konstruktory **nie są dziedziczone** w zwykły sposób. Przy tworzeniu obiektu klasy pochodnej **najpierw** wykonuje się konstruktor klasy bazowej, a potem pochodnej. Destruktory w C++ – w odwrotnej kolejności.

## Polimorfizm

**Polimorfizm** („wielopostaciowość”) – ten sam kod wywołuje różne zachowania w zależności od rzeczywistego typu obiektu.

- **przeciążanie (overloading)** – kilka metod o tej samej nazwie, ale różnych parametrach, w jednej klasie; wybór następuje w czasie **kompilacji** (polimorfizm statyczny),
- **nadpisywanie (overriding)** – klasa pochodna podaje własną implementację metody bazowej o **tej samej sygnaturze**; wybór następuje w czasie **działania programu** (polimorfizm dynamiczny).

```cpp
class Zwierze {
public:
    virtual void dajGlos() { cout << "..."; }
    virtual ~Zwierze() {}
};
class Pies : public Zwierze {
public:
    void dajGlos() override { cout << "Hau!"; }
};

Zwierze* z = new Pies();
z->dajGlos();   // "Hau!" – bo metoda jest wirtualna
```

W C++ i C# metoda musi być oznaczona jako `virtual`, aby dało się ją nadpisać polimorficznie (w C# w klasie pochodnej `override`). W Javie wszystkie metody niestatyczne są domyślnie wirtualne (adnotacja `@Override` jest zalecana).

> [!PULAPKA]
> Bez słowa `virtual` w C++ wywołanie `z->dajGlos()` przez wskaźnik do klasy bazowej użyje wersji z klasy **bazowej** (decyduje typ wskaźnika, a nie obiektu).

## Abstrakcja: klasy abstrakcyjne i interfejsy

**Klasa abstrakcyjna** – nie można utworzyć jej obiektu; służy jako baza dla innych klas. Może zawierać zarówno zaimplementowane metody, jak i **metody abstrakcyjne** (bez ciała), które klasa pochodna **musi** zaimplementować.

- C++: klasa z co najmniej jedną **metodą czysto wirtualną** `virtual void rysuj() = 0;`
- C#/Java: słowo `abstract`.

**Interfejs** – „kontrakt”: zbiór sygnatur metod, które klasa zobowiązuje się zaimplementować. Klasa może implementować **wiele interfejsów**. Interfejs nie przechowuje stanu (pól instancji).

| | Klasa abstrakcyjna | Interfejs |
|---|---|---|
| Pola instancji | tak | nie |
| Konstruktor | tak | nie |
| Implementacje metod | tak | tylko domyślne (C# 8+, Java 8+) |
| Ile można „rozszerzyć” | jedną | wiele |

## Składowe statyczne

Pole lub metoda `static` należy do **klasy**, a nie do konkretnego obiektu. Pole statyczne jest **wspólne dla wszystkich obiektów** – typowy przykład to licznik utworzonych instancji. Metodę statyczną wywołujemy przez nazwę klasy (`Math.Sqrt(x)`), a w jej wnętrzu nie ma dostępu do `this`.

```java
class Licznik {
    static int ile = 0;          // wspólne dla wszystkich obiektów
    Licznik() { ile++; }
}
```

## Inne pojęcia, które warto znać

- `this` (`self` w Pythonie) – referencja do bieżącego obiektu,
- **kompozycja** („ma”) vs **dziedziczenie** („jest”): `Samochód` **ma** `Silnik` (kompozycja), `Samochód` **jest** `Pojazdem` (dziedziczenie),
- **klasa zaprzyjaźniona** (C++, `friend`) – ma dostęp do prywatnych składowych innej klasy,
- `sealed` (C#) / `final` (Java) – zakaz dalszego dziedziczenia po klasie,
- **przeciążanie operatorów** (C++, C#) – własne znaczenie operatorów, np. `+` dla klasy `Wektor`.

> [!CKE]
> W części praktycznej prawie zawsze trzeba **zaprojektować klasę** wg specyfikacji: konkretne nazwy pól, typy, modyfikatory dostępu, konstruktor i metody. Trzymaj się nazw z polecenia co do litery – egzaminator sprawdza je dokładnie.
