---
title: Testowanie, debugowanie i dokumentacja
---

## Po co testujemy

**Testowanie** to sprawdzanie, czy oprogramowanie działa zgodnie z wymaganiami, i wykrywanie błędów. Testy nie dowodzą braku błędów – pokazują ich obecność. Im wcześniej błąd zostanie znaleziony, tym taniej go naprawić.

Pojęcia: **błąd (pomyłka)** człowieka → **defekt** w kodzie → **awaria** (widoczne niepoprawne działanie). **Weryfikacja** – czy budujemy produkt *poprawnie* (zgodnie ze specyfikacją). **Walidacja** – czy budujemy *właściwy* produkt (zgodny z potrzebami użytkownika).

## Poziomy testów

| Poziom | Co sprawdza | Kto/jak |
|---|---|---|
| **Jednostkowe (unit)** | pojedyncze funkcje, metody, klasy w izolacji | programista, frameworki xUnit |
| **Integracyjne** | współpracę modułów (np. aplikacja + baza danych) | programiści/testerzy |
| **Systemowe** | cały system jako całość, wymagania funkcjonalne i niefunkcjonalne | testerzy |
| **Akceptacyjne** | czy system spełnia oczekiwania klienta (testy **alfa** – u producenta, **beta** – u wybranych użytkowników) | klient/użytkownicy |

## Rodzaje i techniki testów

**Czarna skrzynka (black-box)** – testujemy na podstawie specyfikacji, **bez znajomości kodu**: podajemy dane wejściowe i sprawdzamy wyjście. Techniki: **klasy równoważności** (dane dzielimy na grupy zachowujące się tak samo) i **analiza wartości brzegowych** (testujemy granice przedziałów, np. 0, 1, 17, 18 dla warunku `wiek >= 18`).

**Biała skrzynka (white-box)** – testy oparte na **znajomości kodu**: pokrycie instrukcji, gałęzi warunków, ścieżek.

| Rodzaj | Cel |
|---|---|
| **Funkcjonalne** | czy funkcje działają zgodnie z wymaganiami |
| **Regresyjne** | czy po zmianach w kodzie nie zepsuło się to, co wcześniej działało |
| **Wydajnościowe** | czasy odpowiedzi; **obciążeniowe** – praca pod dużym ruchem; **przeciążeniowe (stres)** – zachowanie powyżej limitów |
| **Bezpieczeństwa** | odporność na ataki (np. testy penetracyjne) |
| **Użyteczności** | wygoda obsługi przez użytkownika |
| **Dymne (smoke)** | szybkie sprawdzenie, czy podstawowe funkcje w ogóle działają |
| **Statyczne** | analiza kodu **bez uruchamiania** (przeglądy kodu, lintery) |

> [!CKE]
> Klasyczne pytania: „testy wykonywane bez znajomości kodu” → **czarnej skrzynki**; „sprawdzenie, czy poprawka nie zepsuła innych funkcji” → **regresyjne**; „testowanie pojedynczej metody” → **jednostkowe**.

## Testy jednostkowe w praktyce

Struktura testu – wzorzec **AAA**: **Arrange** (przygotuj dane), **Act** (wywołaj testowaną metodę), **Assert** (sprawdź wynik asercją).

```csharp
[TestMethod]   // MSTest; w xUnit: [Fact], w NUnit: [Test]
public void Dodaj_DwieLiczby_ZwracaSume()
{
    var k = new Kalkulator();          // Arrange
    int wynik = k.Dodaj(2, 3);         // Act
    Assert.AreEqual(5, wynik);         // Assert
}
```

| Język | Popularne frameworki |
|---|---|
| C# | MSTest, NUnit, xUnit |
| Java | JUnit |
| Python | unittest, pytest |
| C++ | Google Test, Catch2 |
| JavaScript | Jest, Vitest, Mocha |

**TDD** (*Test-Driven Development*): najpierw piszesz test, który nie przechodzi (**red**), potem minimalny kod, aby przeszedł (**green**), na końcu poprawiasz kod (**refactor**). **Mock/stub** – obiekt zastępczy symulujący zależność (np. bazę danych) w teście jednostkowym.

## Debugowanie

**Debugger** pozwala wykonywać program krok po kroku i podglądać stan zmiennych.

| Funkcja | Opis |
|---|---|
| **Punkt przerwania (breakpoint)** | wstrzymuje wykonanie w wybranej linii |
| **Step Over** (F10 w Visual Studio) | wykonaj bieżącą linię bez wchodzenia do wywoływanych funkcji |
| **Step Into** (F11) | wejdź do wnętrza wywoływanej funkcji |
| **Step Out** (Shift+F11) | dokończ bieżącą funkcję i wróć do wywołującej |
| **Continue** (F5) | kontynuuj do następnego breakpointu |
| **Watch / Locals** | podgląd wartości zmiennych i wyrażeń |
| **Call Stack** | stos wywołań – jak program dotarł do tego miejsca |

**Rodzaje błędów:** **składniowe** (wykrywa kompilator/interpreter), **wykonania** (runtime – np. dzielenie przez zero, wyjście poza tablicę), **logiczne** (program działa, ale daje zły wynik – najtrudniejsze do wykrycia, tu pomaga debugger i testy).

## Obsługa wyjątków

**Wyjątek** to obiekt sygnalizujący błąd w czasie wykonania. Obsługujemy go blokiem `try–catch–finally`:

```java
try {
    int wynik = a / b;
} catch (ArithmeticException e) {
    System.out.println("Nie dziel przez zero!");
} finally {
    System.out.println("Ten blok wykona się zawsze");
}
```

Python używa `try / except / else / finally`, a wyjątek zgłasza się słowem `raise` (w C#, Javie, C++, JS – `throw`). Blok `finally` wykonuje się **zawsze**, niezależnie od tego, czy wyjątek wystąpił.

> [!PULAPKA]
> Kolejność bloków `catch` ma znaczenie: najpierw wyjątki **szczegółowe**, na końcu **ogólne** (`Exception`). Ogólny `catch` na początku „połknie” wszystko.

## Dokumentacja

**Dokumentacja użytkownika** – instrukcja obsługi, pomoc. **Dokumentacja techniczna** – opis architektury, API, instalacji, kodu.

**Komentarze dokumentujące** generują dokumentację automatycznie:

| Język | Format | Narzędzie |
|---|---|---|
| Java | `/** … */` z `@param`, `@return` | Javadoc |
| C# | `/// <summary>…</summary>` | XML docs, DocFX |
| C++ | `/** … */` lub `///` z `@brief`, `@param` | Doxygen |
| Python | docstring `"""…"""` | Sphinx, pydoc |

> [!CKE]
> W arkuszu praktycznym zwykle jest wymagany **komentarz nagłówkowy** metody/funkcji w podanym formacie, np.:
> `nazwa funkcji`, `opis` (co robi), `parametry`, `zwracany typ`, `autor`. Przepisz szablon z arkusza dokładnie – za każdy element są punkty. Na koniec dokumentacja to zwykle **zrzuty ekranu** działających aplikacji i opis testów (np. nazwa systemu, IDE, wersja środowiska).
