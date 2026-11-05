-- Baza "szkola" – klasy, uczniowie, przedmioty i oceny
PRAGMA foreign_keys = ON;

CREATE TABLE klasy (
    id INTEGER PRIMARY KEY,
    nazwa TEXT NOT NULL,
    profil TEXT NOT NULL,
    wychowawca TEXT
);

CREATE TABLE uczniowie (
    id INTEGER PRIMARY KEY,
    imie TEXT NOT NULL,
    nazwisko TEXT NOT NULL,
    klasa_id INTEGER REFERENCES klasy(id),
    rok_urodzenia INTEGER,
    plec TEXT
);

CREATE TABLE przedmioty (
    id INTEGER PRIMARY KEY,
    nazwa TEXT NOT NULL
);

CREATE TABLE oceny (
    id INTEGER PRIMARY KEY,
    uczen_id INTEGER NOT NULL REFERENCES uczniowie(id),
    przedmiot_id INTEGER NOT NULL REFERENCES przedmioty(id),
    ocena INTEGER NOT NULL CHECK (ocena BETWEEN 1 AND 6),
    data TEXT
);

INSERT INTO klasy (id, nazwa, profil, wychowawca) VALUES
 (1, '3TP', 'technik programista', 'mgr Ewa Malinowska'),
 (2, '4TP', 'technik programista', 'mgr Adam Kruk'),
 (3, '3TI', 'technik informatyk', 'mgr Jan Sowa');

INSERT INTO uczniowie (id, imie, nazwisko, klasa_id, rok_urodzenia, plec) VALUES
 (1, 'Ola', 'Bielecka', 1, 2008, 'K'),
 (2, 'Bartek', 'Czarnecki', 1, 2008, 'M'),
 (3, 'Igor', 'Duda', 1, 2007, 'M'),
 (4, 'Zuzanna', 'Fijałkowska', 2, 2007, 'K'),
 (5, 'Filip', 'Górski', 2, 2006, 'M'),
 (6, 'Maja', 'Jankowska', 2, 2007, 'K'),
 (7, 'Oskar', 'Kaczmarek', 3, 2008, 'M'),
 (8, 'Lena', 'Michalska', 3, 2008, 'K'),
 (9, 'Wiktor', 'Nowicki', 3, 2009, 'M'),
 (10, 'Hanna', 'Pawlak', NULL, 2008, 'K');

INSERT INTO przedmioty (id, nazwa) VALUES
 (1, 'Matematyka'), (2, 'Programowanie obiektowe'), (3, 'Bazy danych'), (4, 'Język angielski');

INSERT INTO oceny (id, uczen_id, przedmiot_id, ocena, data) VALUES
 (1, 1, 1, 5, '2025-09-15'), (2, 1, 2, 6, '2025-09-20'), (3, 1, 3, 5, '2025-10-02'),
 (4, 2, 1, 3, '2025-09-15'), (5, 2, 2, 4, '2025-09-20'), (6, 2, 3, 2, '2025-10-02'),
 (7, 3, 1, 4, '2025-09-16'), (8, 3, 2, 5, '2025-09-22'), (9, 3, 4, 4, '2025-10-05'),
 (10, 4, 1, 6, '2025-09-16'), (11, 4, 2, 5, '2025-09-22'), (12, 4, 3, 6, '2025-10-06'),
 (13, 5, 1, 2, '2025-09-17'), (14, 5, 2, 3, '2025-09-23'), (15, 5, 4, 1, '2025-10-07'),
 (16, 6, 1, 4, '2025-09-17'), (17, 6, 3, 5, '2025-10-08'),
 (18, 7, 1, 1, '2025-09-18'), (19, 7, 2, 3, '2025-09-24'),
 (20, 8, 2, 5, '2025-09-24'), (21, 8, 3, 4, '2025-10-09'), (22, 8, 4, 5, '2025-10-10'),
 (23, 9, 1, 3, '2025-09-18'), (24, 9, 4, 1, '2025-10-10');
