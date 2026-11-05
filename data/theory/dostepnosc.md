---
title: UX i dostępność (WCAG)
---

## UX i UI

**UI** (*User Interface*) – interfejs użytkownika: to, co widać i czego się dotyka (przyciski, kolory, typografia). **UX** (*User Experience*) – całościowe doświadczenie użytkownika: czy aplikacja jest łatwa, szybka, zrozumiała i przyjemna w obsłudze.

Zasady dobrego interfejsu:

- **spójność** – te same elementy wyglądają i działają tak samo w całej aplikacji,
- **informacja zwrotna** – użytkownik widzi efekt swojej akcji (komunikat, zmiana stanu, wskaźnik ładowania),
- **zapobieganie błędom** i czytelne komunikaty o błędach („Hasło musi mieć min. 8 znaków” zamiast „Błąd 0x13”),
- **hierarchia wizualna** – najważniejsze elementy są najbardziej widoczne,
- **prostota** – tylko potrzebne elementy, mało kroków do celu,
- **rozpoznawanie zamiast przypominania** – ikony z etykietami, podpowiedzi, wartości domyślne.

**Makieta (wireframe)** – szkic układu bez szczegółów graficznych. **Mockup** – statyczny projekt graficzny. **Prototyp** – klikalna symulacja aplikacji (np. w Figmie).

## Dostępność cyfrowa

**Dostępność** (*accessibility*, a11y) oznacza, że z aplikacji mogą korzystać wszyscy, także osoby z niepełnosprawnościami: niewidome i słabowidzące (czytniki ekranu, powiększenie), niesłyszące, z ograniczeniami ruchowymi (obsługa samą klawiaturą), z trudnościami poznawczymi.

W Polsce obowiązuje **ustawa o dostępności cyfrowej stron internetowych i aplikacji mobilnych podmiotów publicznych**, która odwołuje się do standardu **WCAG 2.1** na poziomie **AA**.

## WCAG – cztery zasady

**WCAG** (*Web Content Accessibility Guidelines*) – wytyczne W3C. Poziomy zgodności: **A** (minimum), **AA** (standardowo wymagany), **AAA** (najwyższy).

| Zasada | Znaczenie | Przykłady |
|---|---|---|
| **Postrzegalność** | treść musi być możliwa do odebrania | tekst alternatywny dla obrazów, napisy do filmów, odpowiedni kontrast |
| **Funkcjonalność** | interfejs musi dać się obsłużyć | pełna obsługa klawiaturą, wystarczający czas, brak migających elementów |
| **Zrozumiałość** | treść i obsługa muszą być zrozumiałe | prosty język, przewidywalne działanie, pomoc przy błędach w formularzach |
| **Solidność (kompatybilność)** | działanie z różnymi przeglądarkami i technologiami asystującymi | poprawny, semantyczny HTML, atrybuty ARIA |

> [!WZOR] Kontrast wg WCAG 2.1 (poziom AA)
> Zwykły tekst: co najmniej **4,5 : 1**. Duży tekst (od 18 pt lub 14 pt pogrubiony): co najmniej **3 : 1**. Poziom AAA: 7 : 1.

## Dostępność w praktyce

- `alt` w każdym obrazie niosącym treść (`<img src="logo.png" alt="Logo szkoły">`), pusty `alt=""` dla grafik dekoracyjnych,
- **semantyczny HTML**: `<header>`, `<nav>`, `<main>`, `<button>` zamiast klikalnego `<div>`, nagłówki `h1–h6` w logicznej kolejności,
- etykiety formularzy powiązane z polem: `<label for="email">E-mail</label><input id="email">`,
- widoczny **fokus** i logiczna kolejność przechodzenia klawiszem **Tab**,
- informacja nie może być przekazywana **wyłącznie kolorem** (np. błąd = czerwona ramka **i** komunikat tekstowy),
- atrybuty **ARIA** (`aria-label`, `aria-live`, `role`) tam, gdzie HTML nie wystarcza,
- język strony: `<html lang="pl">`,
- odpowiednio duże elementy dotykowe na urządzeniach mobilnych.

> [!CKE]
> Pytania o dostępność dotyczą najczęściej: atrybutu `alt`, minimalnego kontrastu, zasad WCAG (postrzegalność, funkcjonalność, zrozumiałość, solidność) oraz tego, dlaczego nie wolno przekazywać informacji samym kolorem.

## Responsywność (RWD)

**RWD** (*Responsive Web Design*) – układ dopasowuje się do rozmiaru ekranu.

- znacznik `<meta name="viewport" content="width=device-width, initial-scale=1">`,
- **media queries**: `@media (max-width: 768px) { … }`,
- elastyczne układy: **Flexbox** (jednowymiarowy – wiersz lub kolumna) i **CSS Grid** (dwuwymiarowy – wiersze i kolumny),
- jednostki względne: `%`, `em`, `rem`, `vw`, `vh`, `fr` (w Gridzie),
- podejście **mobile first** – najpierw style dla telefonu, potem rozszerzenia dla większych ekranów.

> [!INFO]
> Ta aplikacja stosuje opisane zasady: semantyczny HTML, obsługę klawiatury (skróty 1–4 w quizach), widoczny fokus, `aria-live` dla komunikatów, kontrast na poziomie AA oraz poszanowanie ustawienia „ogranicz animacje” (`prefers-reduced-motion`).
