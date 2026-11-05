---
title: Narzędzia programisty
---

## Kompilacja a interpretacja

| | Kompilator | Interpreter |
|---|---|---|
| Działanie | tłumaczy **cały** kod źródłowy na kod maszynowy przed uruchomieniem | wykonuje kod **instrukcja po instrukcji** w trakcie działania |
| Wynik | plik wykonywalny (np. `.exe`) | brak osobnego pliku wynikowego |
| Szybkość działania | zwykle wyższa | zwykle niższa |
| Wykrywanie błędów składni | przed uruchomieniem (na etapie kompilacji) | w momencie dojścia do błędnej linii |
| Przykłady | C, C++, Rust, Go | Python, PHP, JavaScript (w praktyce z kompilacją JIT) |

**Rozwiązania pośrednie:** Java kompiluje kod do **kodu bajtowego** (`.class`), który wykonuje **maszyna wirtualna JVM**. C# kompiluje się do języka pośredniego **CIL/IL**, który wykonuje środowisko **CLR** platformy .NET. Kompilator **JIT** (*Just-In-Time*) zamienia kod pośredni na maszynowy w czasie działania.

**Etapy budowania programu w C/C++:** preprocesor (`#include`, `#define`) → kompilacja (pliki obiektowe `.o`/`.obj`) → **linkowanie** (konsolidacja z bibliotekami) → plik wykonywalny.

> [!CKE]
> Pytanie „który program tłumaczy cały kod przed uruchomieniem” → **kompilator**. „Program łączący pliki obiektowe i biblioteki w plik wykonywalny” → **linker (konsolidator)**.

## Języki programowania – klasyfikacja

- **niskiego poziomu** (asembler – blisko sprzętu) vs **wysokiego poziomu** (C#, Java, Python),
- **paradygmaty:** proceduralny/strukturalny (C), obiektowy (Java, C#), funkcyjny (Haskell, elementy w JS/Python/C#), deklaratywny (SQL, HTML), zdarzeniowy (GUI),
- **typowanie:** statyczne (C++, C#, Java) vs dynamiczne (Python, JS); silne vs słabe.

## Środowiska programistyczne (IDE)

**IDE** (*Integrated Development Environment*) łączy edytor kodu, kompilator/interpreter, debugger, podpowiadanie składni (IntelliSense), zarządzanie projektem i integrację z Gitem.

| IDE / edytor | Typowe zastosowanie |
|---|---|
| **Visual Studio** | C#, C++, .NET (WinForms, WPF, MAUI) |
| **Visual Studio Code** | edytor wielojęzyczny z rozszerzeniami – web, Python, JS/TS |
| **IntelliJ IDEA** | Java, Kotlin |
| **Android Studio** | aplikacje Android (Kotlin/Java) |
| **PyCharm** | Python |
| **Code::Blocks**, **CLion** | C/C++ |
| **Eclipse**, **NetBeans** | Java |

## System kontroli wersji Git

**Git** to rozproszony system kontroli wersji – zapisuje historię zmian kodu, pozwala wrócić do poprzednich wersji i pracować zespołowo. **GitHub**, **GitLab**, **Bitbucket** to serwisy hostujące zdalne repozytoria.

| Polecenie | Działanie |
|---|---|
| `git init` | utworzenie nowego repozytorium |
| `git clone <url>` | skopiowanie zdalnego repozytorium |
| `git status` | stan plików (zmienione, przygotowane) |
| `git add <plik>` | dodanie zmian do **poczekalni** (staging area) |
| `git commit -m "opis"` | zapisanie migawki zmian w historii |
| `git push` | wysłanie commitów do repozytorium zdalnego |
| `git pull` | pobranie i scalenie zmian ze zdalnego repozytorium |
| `git fetch` | pobranie zmian **bez** scalania |
| `git branch <nazwa>` | utworzenie gałęzi |
| `git checkout` / `git switch` | przełączenie gałęzi |
| `git merge <gałąź>` | scalenie gałęzi z bieżącą |
| `git log` | historia commitów |
| `git diff` | różnice między wersjami |

**Gałąź (branch)** – niezależna linia rozwoju (np. nowa funkcja na gałęzi `feature/logowanie`). **Konflikt scalania** powstaje, gdy dwie gałęzie zmieniły ten sam fragment pliku – trzeba go rozwiązać ręcznie. **Pull request / merge request** – prośba o włączenie zmian do głównej gałęzi z przeglądem kodu. Plik **`.gitignore`** wskazuje pliki, których Git ma nie śledzić (np. `bin/`, `node_modules/`).

> [!PULAPKA]
> `git commit` zapisuje zmiany **tylko lokalnie**. Żeby trafiły na GitHuba, trzeba wykonać `git push`. A `git pull` = `git fetch` + `git merge`.

## Biblioteki, pakiety i frameworki

**Biblioteka** – gotowy zestaw funkcji/klas, który **Ty wywołujesz** w swoim kodzie. **Framework** – szkielet aplikacji, który **wywołuje Twój kod** (odwrócenie sterowania). **API** – interfejs, przez który programy komunikują się ze sobą.

| Ekosystem | Menedżer pakietów | Plik konfiguracyjny |
|---|---|---|
| .NET (C#) | **NuGet** | `.csproj` |
| Java | **Maven**, **Gradle** | `pom.xml`, `build.gradle` |
| Python | **pip** | `requirements.txt` |
| JavaScript | **npm**, **yarn** | `package.json` |
| C++ | vcpkg, Conan | |

**Biblioteka statyczna** (`.lib`, `.a`) jest dołączana do pliku wykonywalnego podczas linkowania. **Biblioteka dynamiczna** (`.dll` w Windows, `.so` w Linux) jest ładowana w czasie działania programu i może być współdzielona przez wiele programów.

> [!INFO]
> **CI/CD** (*Continuous Integration / Continuous Delivery*) – automatyczne budowanie, testowanie i wdrażanie kodu po każdej zmianie, np. przez GitHub Actions. Ta aplikacja używa GitHub Actions do sprawdzania poprawności plików z pytaniami.
