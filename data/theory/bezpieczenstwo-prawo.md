---
title: Bezpieczeństwo, licencje i prawo
---

## Licencje oprogramowania

**Licencja** określa, co wolno zrobić z programem (używać, kopiować, modyfikować, rozpowszechniać).

| Licencja / model | Charakterystyka |
|---|---|
| **Freeware** | darmowe użytkowanie, ale **bez dostępu do kodu** i zwykle bez prawa modyfikacji |
| **Shareware** | wersja próbna – ograniczona czasowo lub funkcjonalnie; po okresie próbnym trzeba zapłacić |
| **Trial / Demo** | pełna wersja na określony czas / wersja demonstracyjna z ograniczeniami |
| **Adware** | darmowe, finansowane przez wyświetlane reklamy |
| **Komercyjna (własnościowa)** | płatna, kod zamknięty, warunki w umowie licencyjnej **EULA** |
| **OEM** | dołączona do sprzętu (np. Windows na nowym komputerze); przypisana do tego urządzenia |
| **Box (BOX/retail)** | pudełkowa, można ją przenieść na inny komputer |
| **Public domain** | autor zrzekł się praw majątkowych – dowolne użycie |

### Licencje open source

| Licencja | Najważniejsze |
|---|---|
| **GNU GPL** | wolne oprogramowanie z **copyleft**: zmodyfikowany i rozpowszechniany program musi być udostępniony na tej samej licencji wraz z kodem źródłowym |
| **GNU LGPL** | łagodniejsza – bibliotekę można używać w programach zamkniętych |
| **MIT** | bardzo liberalna: można wszystko (także w projektach komercyjnych zamkniętych), trzeba zachować informację o autorze i licencji |
| **Apache 2.0** | liberalna, dodatkowo zawiera klauzulę patentową |
| **BSD** | liberalna, podobna do MIT |
| **Creative Commons** | licencje dla **treści** (teksty, grafiki): oznaczenia BY (uznanie autorstwa), SA (na tych samych warunkach), NC (bez użytku komercyjnego), ND (bez utworów zależnych) |

> [!CKE]
> Najczęstsze pytania: freeware vs shareware, czym jest OEM, która licencja wymusza udostępnienie kodu zmodyfikowanej wersji (**GPL** – copyleft) i co oznaczają skróty Creative Commons.

## Prawo autorskie

W Polsce reguluje je **ustawa o prawie autorskim i prawach pokrewnych**. Program komputerowy jest chroniony jak **utwór literacki**.

- **autorskie prawa osobiste** – więź twórcy z utworem (np. prawo do autorstwa); są **niezbywalne** i nieograniczone w czasie,
- **autorskie prawa majątkowe** – prawo do korzystania z utworu i czerpania z niego korzyści; **można je przenieść** (sprzedać) lub udzielić licencji; wygasają co do zasady 70 lat po śmierci twórcy,
- program stworzony przez pracownika w ramach obowiązków służbowych – prawa majątkowe przysługują co do zasady **pracodawcy**,
- użytkownik legalnego programu może wykonać **kopię zapasową**, jeśli jest niezbędna do korzystania z programu.

## RODO – ochrona danych osobowych

**RODO** (GDPR) – unijne rozporządzenie o ochronie danych osobowych. **Dane osobowe** to informacje o zidentyfikowanej lub możliwej do zidentyfikowania osobie (imię i nazwisko, PESEL, e-mail, adres IP, lokalizacja).

Zasady: zgodność z prawem i przejrzystość, ograniczenie celu, **minimalizacja danych** (zbieraj tylko niezbędne), prawidłowość, ograniczenie przechowywania, integralność i poufność. Prawa osoby: dostęp do danych, sprostowanie, **usunięcie („prawo do bycia zapomnianym”)**, przenoszenie danych, sprzeciw.

**Privacy by design / by default** – ochrona danych uwzględniona już na etapie projektowania aplikacji. **Administrator danych** decyduje o celach przetwarzania, **podmiot przetwarzający** przetwarza dane w jego imieniu.

## Typowe ataki na aplikacje

| Atak | Na czym polega | Obrona |
|---|---|---|
| **SQL Injection** | wstrzyknięcie fragmentu SQL przez pole formularza, np. `' OR '1'='1` | **zapytania parametryzowane**, ORM, walidacja danych |
| **XSS** (*Cross-Site Scripting*) | wstrzyknięcie złośliwego skryptu JS do strony oglądanej przez innych | **escapowanie/kodowanie** danych wyjściowych, `textContent` zamiast `innerHTML`, nagłówek CSP |
| **CSRF** | wymuszenie wykonania akcji przez zalogowanego użytkownika z innej strony | tokeny CSRF, atrybut ciasteczek `SameSite` |
| **Brute force** | zgadywanie hasła metodą prób | limit prób, blokada konta, CAPTCHA, 2FA |
| **Phishing** | podszywanie się (fałszywe strony, e-maile) w celu wyłudzenia danych | edukacja, weryfikacja adresów, 2FA |
| **DoS / DDoS** | przeciążenie usługi masowymi żądaniami | filtrowanie ruchu, limity, CDN |
| **Man-in-the-middle** | podsłuch/modyfikacja komunikacji | **HTTPS (TLS)**, certyfikaty |

> [!PULAPKA]
> Walidacja danych **tylko po stronie klienta** (w JavaScript) nie chroni aplikacji – użytkownik może ją obejść. Dane zawsze trzeba sprawdzać **także na serwerze**.

## Przechowywanie haseł i kryptografia

**Haseł nie szyfruje się, tylko hashuje.** **Funkcja skrótu (hash)** jest **jednokierunkowa** – z hasha nie da się odtworzyć hasła. Przy logowaniu hashujemy wpisane hasło i porównujemy hashe.

- **sól (salt)** – losowy dodatek do hasła przed hashowaniem; ten sam ciąg daje różne hashe, co utrudnia ataki tablicami tęczowymi,
- do haseł używa się **wolnych** algorytmów: **bcrypt**, **scrypt**, **Argon2**, **PBKDF2**,
- **MD5** i **SHA-1** są przestarzałe i **nie nadają się** do haseł.

**Szyfrowanie symetryczne** – ten sam klucz szyfruje i deszyfruje (np. **AES**). **Szyfrowanie asymetryczne** – para kluczy: **publiczny** (szyfrowanie, weryfikacja podpisu) i **prywatny** (deszyfrowanie, podpisywanie); np. **RSA**. **Podpis cyfrowy** potwierdza autentyczność i integralność danych.

> [!WZOR] Dobre praktyki bezpiecznego kodu
> Zasada **najmniejszych uprawnień**, walidacja wszystkich danych wejściowych, zapytania parametryzowane, HTTPS, aktualne biblioteki, brak haseł i kluczy w kodzie źródłowym (i w repozytorium Git!), uwierzytelnianie wieloskładnikowe (2FA/MFA).
