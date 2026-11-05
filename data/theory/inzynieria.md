---
title: Inżynieria oprogramowania
---

## Cykl życia oprogramowania

Typowe etapy wytwarzania oprogramowania (SDLC – *Software Development Life Cycle*):

1. **Analiza wymagań** – co system ma robić (wymagania **funkcjonalne**) i jakie ma mieć cechy (wymagania **niefunkcjonalne**: wydajność, bezpieczeństwo, dostępność).
2. **Projektowanie** – architektura, model danych, interfejs, diagramy UML.
3. **Implementacja** – pisanie kodu.
4. **Testowanie** – weryfikacja zgodności z wymaganiami.
5. **Wdrożenie** – instalacja u klienta / publikacja.
6. **Utrzymanie (konserwacja)** – poprawki błędów, aktualizacje, rozwój.

> [!WZOR] Wymagania
> **Funkcjonalne** = *co* system robi (np. „użytkownik może zresetować hasło”). **Niefunkcjonalne** = *jak* to robi (np. „strona ładuje się w mniej niż 2 s”, „aplikacja działa na Androidzie 10+”).

## Modele i metodyki

| Model | Charakterystyka |
|---|---|
| **Kaskadowy (wodospadowy)** | etapy wykonywane sekwencyjnie, jeden po drugim; łatwy do zaplanowania, ale trudno wprowadzać zmiany w trakcie |
| **Model V** | rozwinięcie kaskadowego – każdemu etapowi projektowania odpowiada poziom testów |
| **Przyrostowy** | system powstaje w kolejnych częściach (przyrostach), każda dodaje funkcjonalność |
| **Spiralny** | kolejne cykle (spirale) z naciskiem na **analizę ryzyka** |
| **Prototypowy** | szybki prototyp pozwala doprecyzować wymagania z klientem |
| **Zwinne (Agile)** | krótkie iteracje, ścisła współpraca z klientem, gotowość na zmiany |

### Agile i Scrum

**Manifest Agile** ceni: ludzi i interakcje ponad procesy i narzędzia, działające oprogramowanie ponad obszerną dokumentację, współpracę z klientem ponad negocjacje umów, reagowanie na zmiany ponad realizację planu.

**Scrum** – najpopularniejsza metodyka zwinna:

| Element | Opis |
|---|---|
| **Sprint** | iteracja o stałej długości (zwykle 1–4 tygodnie), kończy się działającym przyrostem produktu |
| **Product Owner** | odpowiada za wartość produktu i priorytety w Product Backlogu |
| **Scrum Master** | dba o przestrzeganie zasad Scruma i usuwa przeszkody zespołu |
| **Zespół deweloperski** | samoorganizujący się zespół wytwarzający produkt |
| **Product Backlog** | uporządkowana lista wszystkiego, co ma powstać |
| **Sprint Backlog** | zadania wybrane do realizacji w danym sprincie |
| **Daily Scrum** | codzienne krótkie (do 15 min) spotkanie zespołu |
| **Sprint Review / Retrospective** | pokaz efektów sprintu / analiza sposobu pracy |

**Kanban** – wizualizacja pracy na tablicy z kolumnami (np. *Do zrobienia → W trakcie → Gotowe*) i limit zadań w toku (WIP).

> [!CKE]
> Najczęstsze pytania: które cechy pasują do modelu kaskadowego (sztywna kolejność etapów), czym jest sprint, kto ustala priorytety w backlogu (**Product Owner**) i co to jest **Daily Scrum**.

## Język UML

**UML** (*Unified Modeling Language*) – graficzny język do modelowania systemów.

| Diagram | Do czego służy |
|---|---|
| **Przypadków użycia** | aktorzy (ludzik) i funkcje systemu (elipsy) – co system robi dla użytkownika |
| **Klas** | klasy z polami i metodami oraz relacje między nimi |
| **Sekwencji** | wymiana komunikatów między obiektami w czasie |
| **Aktywności** | przepływ czynności (podobny do schematu blokowego) |
| **Stanów** | stany obiektu i przejścia między nimi |
| **Komponentów / wdrożenia** | budowa fizyczna systemu i rozmieszczenie na sprzęcie |

### Diagram klas – oznaczenia

| Symbol | Znaczenie |
|---|---|
| `+` | public |
| `-` | private |
| `#` | protected |
| `~` | package (pakietowy) |
| podkreślenie | składowa statyczna |
| kursywa | klasa/metoda abstrakcyjna |

Relacje: **dziedziczenie** (linia z pustym trójkątem przy klasie bazowej), **realizacja interfejsu** (linia przerywana z pustym trójkątem), **asocjacja** (zwykła linia), **agregacja** (pusty romb – część może istnieć bez całości), **kompozycja** (wypełniony romb – część nie istnieje bez całości), **zależność** (strzałka przerywana).

> [!PULAPKA]
> Agregacja vs kompozycja: **romb pusty** = agregacja (np. Drużyna – Zawodnik: zawodnik istnieje bez drużyny), **romb pełny** = kompozycja (np. Dom – Pokój: pokój nie istnieje bez domu).

## Wzorce projektowe

**Wzorzec projektowy** to sprawdzone, uniwersalne rozwiązanie często powtarzającego się problemu projektowego.

| Kategoria | Wzorzec | Idea |
|---|---|---|
| Kreacyjne | **Singleton** | klasa ma dokładnie jedną instancję z globalnym punktem dostępu (prywatny konstruktor + statyczna metoda) |
| | **Fabryka (Factory Method)** | tworzenie obiektów zlecone metodzie/klasie, która decyduje o typie |
| | **Budowniczy (Builder)** | tworzenie złożonego obiektu krok po kroku |
| Strukturalne | **Adapter** | dopasowanie interfejsu jednej klasy do oczekiwanego przez klienta |
| | **Dekorator** | dynamiczne dodawanie funkcjonalności obiektowi |
| | **Fasada** | uproszczony interfejs do złożonego podsystemu |
| Czynnościowe | **Obserwator** | obiekty-subskrybenci są powiadamiane o zmianie stanu obiektu obserwowanego (zdarzenia) |
| | **Strategia** | wymienne algorytmy za wspólnym interfejsem |
| | **Iterator** | sekwencyjny dostęp do elementów kolekcji |

**Wzorce architektoniczne:** **MVC** (*Model–View–Controller*: dane – widok – logika sterująca), **MVVM** (*Model–View–ViewModel*, typowy dla WPF i .NET MAUI, oparty na wiązaniu danych), architektura **klient–serwer**, **warstwowa**, **mikroserwisy**.

## Czysty kod i zasady projektowania

- **DRY** (*Don't Repeat Yourself*) – nie powielaj kodu, wydzielaj funkcje,
- **KISS** (*Keep It Simple, Stupid*) – najprostsze działające rozwiązanie,
- **YAGNI** (*You Aren't Gonna Need It*) – nie implementuj „na zapas”,
- **SOLID** – pięć zasad OOP: **S**ingle responsibility (jedna odpowiedzialność klasy), **O**pen/closed (otwarte na rozszerzenia, zamknięte na modyfikacje), **L**iskov substitution (obiekt pochodny może zastąpić bazowy), **I**nterface segregation (małe, wyspecjalizowane interfejsy), **D**ependency inversion (zależność od abstrakcji, nie od konkretów),
- **refaktoryzacja** – poprawa struktury kodu **bez zmiany jego działania**,
- czytelne nazwy, krótkie funkcje, komentarze tłumaczące „dlaczego”, a nie „co”.

> [!INFO]
> **Dług techniczny** to koszt przyszłych poprawek wynikający z rozwiązań „na skróty” teraz. Refaktoryzacja i testy pomagają go spłacać.
