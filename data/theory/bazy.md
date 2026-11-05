---
title: Bazy danych w aplikacjach
---

## Model relacyjny

**Relacyjna baza danych** przechowuje dane w **tabelach** (relacjach). Wiersz to **rekord** (krotka), kolumna – **atrybut** (pole). **SZBD** (system zarządzania bazą danych, DBMS): MySQL/MariaDB, PostgreSQL, Microsoft SQL Server, Oracle, SQLite.

| Pojęcie | Opis |
|---|---|
| **Klucz główny (PRIMARY KEY)** | jednoznacznie identyfikuje rekord; unikalny i niepusty |
| **Klucz obcy (FOREIGN KEY)** | kolumna odwołująca się do klucza głównego innej tabeli – tworzy relację |
| **Integralność referencyjna** | klucz obcy musi wskazywać istniejący rekord |
| **Indeks** | przyspiesza wyszukiwanie kosztem miejsca i wolniejszych zapisów |
| **AUTO_INCREMENT** | automatyczne nadawanie kolejnych numerów |

**Relacje:** **1:1** (osoba – dowód), **1:N** (klasa – uczniowie; najczęstsza), **N:M** (uczniowie – przedmioty; realizowana **tabelą pośredniczącą** z dwoma kluczami obcymi).

**Normalizacja** – usuwanie nadmiarowości: **1NF** (wartości atomowe, bez powtarzających się grup), **2NF** (1NF + każde pole niekluczowe zależy od całego klucza), **3NF** (2NF + brak zależności przechodnich między polami niekluczowymi).

## Podstawy SQL

SQL dzieli się na podjęzyki: **DDL** (definicja struktury: `CREATE`, `ALTER`, `DROP`), **DML** (operacje na danych: `SELECT`, `INSERT`, `UPDATE`, `DELETE`), **DCL** (uprawnienia: `GRANT`, `REVOKE`), **TCL** (transakcje: `COMMIT`, `ROLLBACK`).

> [!WZOR] Kolejność klauzul SELECT
> `SELECT` kolumny → `FROM` tabela → `JOIN` … `ON` → `WHERE` warunek na wiersze → `GROUP BY` → `HAVING` warunek na grupy → `ORDER BY` → `LIMIT`.

```sql
SELECT k.nazwa, COUNT(*) AS liczba_uczniow, AVG(u.srednia) AS srednia_klasy
FROM uczniowie u
JOIN klasy k ON u.klasa_id = k.id
WHERE u.rok_urodzenia >= 2008
GROUP BY k.nazwa
HAVING COUNT(*) > 2
ORDER BY srednia_klasy DESC;
```

Najważniejsze elementy:

- **filtrowanie:** `=`, `<>`, `>`, `BETWEEN a AND b`, `IN (…)`, `LIKE 'A%'` (`%` – dowolny ciąg, `_` – jeden znak), `IS NULL`,
- **funkcje agregujące:** `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`,
- **DISTINCT** – usuwa duplikaty,
- **aliasy:** `AS` dla kolumn i tabel.

> [!PULAPKA]
> Warunku na funkcję agregującą nie wolno wpisać do `WHERE` – służy do tego `HAVING`. `WHERE` filtruje wiersze **przed** grupowaniem, `HAVING` – grupy **po** grupowaniu. Wartość `NULL` sprawdzamy przez `IS NULL`, a nie `= NULL`.

## Złączenia (JOIN)

| Złączenie | Wynik |
|---|---|
| `INNER JOIN` | tylko pasujące wiersze z obu tabel |
| `LEFT JOIN` | wszystkie wiersze z lewej tabeli + pasujące z prawej (brak → `NULL`) |
| `RIGHT JOIN` | wszystkie z prawej + pasujące z lewej |
| `FULL OUTER JOIN` | wszystkie wiersze z obu tabel |
| `CROSS JOIN` | iloczyn kartezjański (każdy z każdym) |

## Modyfikacja danych

```sql
INSERT INTO uczniowie (imie, nazwisko, klasa_id) VALUES ('Jan', 'Nowak', 2);
UPDATE uczniowie SET klasa_id = 3 WHERE id = 15;
DELETE FROM uczniowie WHERE id = 15;
```

> [!PULAPKA]
> `UPDATE` lub `DELETE` **bez `WHERE`** zmienia/usuwa **wszystkie** wiersze tabeli.

**Transakcja** – grupa operacji wykonywana w całości albo wcale. Właściwości **ACID**: **A**tomowość (wszystko albo nic), **C**zyli spójność (*Consistency*), **I**zolacja (transakcje nie przeszkadzają sobie), **D**urability – trwałość (zatwierdzone zmiany przetrwają awarię).

## Baza danych w aplikacji

Aplikacja łączy się z bazą za pomocą **sterownika/konektora** (np. ADO.NET w C#, JDBC w Javie, `sqlite3`/`mysql-connector` w Pythonie, PDO/mysqli w PHP). Dane logowania i adres bazy zapisuje się w **łańcuchu połączenia** (*connection string*).

**Zapytania parametryzowane** (przygotowane, *prepared statements*) – dane od użytkownika przekazujemy jako parametry, a nie doklejamy do tekstu SQL. To podstawowa ochrona przed **SQL Injection**.

```csharp
var cmd = new SqlCommand("SELECT * FROM uzytkownicy WHERE login = @login", conn);
cmd.Parameters.AddWithValue("@login", txtLogin.Text);
```

**ORM** (*Object-Relational Mapping*) – mapowanie tabel na klasy i rekordów na obiekty, dzięki czemu operujemy na obiektach zamiast pisać SQL ręcznie. Przykłady: **Entity Framework** (C#), **Hibernate/JPA** (Java), **SQLAlchemy**, **Django ORM** (Python), **Room** (Android).

**CRUD** – cztery podstawowe operacje na danych: **C**reate (INSERT), **R**ead (SELECT), **U**pdate (UPDATE), **D**elete (DELETE).

> [!INFO]
> Bazy **NoSQL** nie używają tabel relacyjnych: dokumentowe (MongoDB – dokumenty JSON), klucz–wartość (Redis), grafowe (Neo4j), kolumnowe (Cassandra). Sprawdzają się przy dużej skali i elastycznej strukturze danych.

> [!CKE]
> SQL jest szczegółowo sprawdzany w INF.03, ale w INF.04 może pojawić się w pytaniach o relacje, klucze, złączenia, ORM i bezpieczeństwo zapytań. Ćwicz w module **SQL Lab**.
