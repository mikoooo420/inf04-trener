-- Baza "biblioteka" – książki, autorzy, czytelnicy i wypożyczenia
PRAGMA foreign_keys = ON;

CREATE TABLE autorzy (
    id INTEGER PRIMARY KEY,
    imie TEXT NOT NULL,
    nazwisko TEXT NOT NULL
);

CREATE TABLE ksiazki (
    id INTEGER PRIMARY KEY,
    tytul TEXT NOT NULL,
    autor_id INTEGER REFERENCES autorzy(id),
    rok_wydania INTEGER,
    gatunek TEXT
);

CREATE TABLE czytelnicy (
    id INTEGER PRIMARY KEY,
    imie TEXT NOT NULL,
    nazwisko TEXT NOT NULL,
    klasa TEXT
);

CREATE TABLE wypozyczenia (
    id INTEGER PRIMARY KEY,
    ksiazka_id INTEGER NOT NULL REFERENCES ksiazki(id),
    czytelnik_id INTEGER NOT NULL REFERENCES czytelnicy(id),
    data_wypozyczenia TEXT NOT NULL,
    data_zwrotu TEXT
);

INSERT INTO autorzy (id, imie, nazwisko) VALUES
 (1, 'Andrzej', 'Sapkowski'), (2, 'Stanisław', 'Lem'), (3, 'Olga', 'Tokarczuk'),
 (4, 'Henryk', 'Sienkiewicz'), (5, 'Robert C.', 'Martin');

INSERT INTO ksiazki (id, tytul, autor_id, rok_wydania, gatunek) VALUES
 (1, 'Ostatnie życzenie', 1, 1993, 'fantastyka'),
 (2, 'Miecz przeznaczenia', 1, 1992, 'fantastyka'),
 (3, 'Solaris', 2, 1961, 'science fiction'),
 (4, 'Cyberiada', 2, 1965, 'science fiction'),
 (5, 'Bieguni', 3, 2007, 'powieść'),
 (6, 'Księgi Jakubowe', 3, 2014, 'powieść'),
 (7, 'Quo vadis', 4, 1896, 'powieść historyczna'),
 (8, 'Krzyżacy', 4, 1900, 'powieść historyczna'),
 (9, 'Czysty kod', 5, 2008, 'informatyka'),
 (10, 'Czysta architektura', 5, 2017, 'informatyka');

INSERT INTO czytelnicy (id, imie, nazwisko, klasa) VALUES
 (1, 'Ola', 'Bielecka', '3TP'), (2, 'Igor', 'Duda', '3TP'), (3, 'Maja', 'Jankowska', '4TP'),
 (4, 'Oskar', 'Kaczmarek', '3TI'), (5, 'Lena', 'Michalska', '3TI'), (6, 'Hanna', 'Pawlak', '2TP');

INSERT INTO wypozyczenia (id, ksiazka_id, czytelnik_id, data_wypozyczenia, data_zwrotu) VALUES
 (1, 1, 1, '2025-09-02', '2025-09-20'),
 (2, 9, 1, '2025-09-21', NULL),
 (3, 3, 2, '2025-09-05', '2025-09-25'),
 (4, 1, 3, '2025-09-22', '2025-10-10'),
 (5, 7, 4, '2025-10-01', NULL),
 (6, 9, 5, '2025-09-10', '2025-09-30'),
 (7, 4, 5, '2025-10-03', NULL),
 (8, 2, 2, '2025-10-05', '2025-10-20'),
 (9, 10, 3, '2025-10-12', NULL);
