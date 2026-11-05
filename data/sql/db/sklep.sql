-- Baza "sklep" – sklep internetowy z elektroniką
PRAGMA foreign_keys = ON;

CREATE TABLE kategorie (
    id INTEGER PRIMARY KEY,
    nazwa TEXT NOT NULL
);

CREATE TABLE produkty (
    id INTEGER PRIMARY KEY,
    nazwa TEXT NOT NULL,
    kategoria_id INTEGER NOT NULL REFERENCES kategorie(id),
    cena REAL NOT NULL,
    stan INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE klienci (
    id INTEGER PRIMARY KEY,
    imie TEXT NOT NULL,
    nazwisko TEXT NOT NULL,
    miasto TEXT,
    email TEXT,
    data_rejestracji TEXT
);

CREATE TABLE zamowienia (
    id INTEGER PRIMARY KEY,
    klient_id INTEGER NOT NULL REFERENCES klienci(id),
    data TEXT NOT NULL,
    status TEXT NOT NULL
);

CREATE TABLE pozycje (
    id INTEGER PRIMARY KEY,
    zamowienie_id INTEGER NOT NULL REFERENCES zamowienia(id),
    produkt_id INTEGER NOT NULL REFERENCES produkty(id),
    ilosc INTEGER NOT NULL
);

INSERT INTO kategorie (id, nazwa) VALUES
 (1, 'Laptopy'), (2, 'Smartfony'), (3, 'Akcesoria'), (4, 'Monitory'), (5, 'Podzespoły');

INSERT INTO produkty (id, nazwa, kategoria_id, cena, stan) VALUES
 (1, 'Laptop Nova 14', 1, 3299.00, 7),
 (2, 'Laptop Orbit 16 Pro', 1, 5899.00, 3),
 (3, 'Laptop Student 15', 1, 2199.00, 12),
 (4, 'Smartfon Pixelon 8', 2, 2499.00, 9),
 (5, 'Smartfon Lite A3', 2, 799.00, 25),
 (6, 'Smartfon Max Ultra', 2, 4599.00, 0),
 (7, 'Mysz bezprzewodowa M2', 3, 89.99, 60),
 (8, 'Klawiatura mechaniczna K7', 3, 349.00, 18),
 (9, 'Słuchawki BassGo', 3, 199.00, 34),
 (10, 'Kabel USB-C 2 m', 3, 29.90, 150),
 (11, 'Monitor 24" FullView', 4, 699.00, 11),
 (12, 'Monitor 27" QHD Pro', 4, 1399.00, 6),
 (13, 'Dysk SSD 1 TB', 5, 329.00, 40),
 (14, 'Pamięć RAM 16 GB', 5, 219.00, 22),
 (15, 'Karta graficzna RX 7700', 5, 2099.00, 4);

INSERT INTO klienci (id, imie, nazwisko, miasto, email, data_rejestracji) VALUES
 (1, 'Anna', 'Kowalska', 'Kraków', 'anna.kowalska@gmail.com', '2024-01-15'),
 (2, 'Piotr', 'Nowak', 'Warszawa', 'pnowak@wp.pl', '2024-02-03'),
 (3, 'Katarzyna', 'Wiśniewska', 'Kraków', 'kasia.w@gmail.com', '2024-03-21'),
 (4, 'Tomasz', 'Wójcik', 'Gdańsk', 'tomasz.wojcik@onet.pl', '2024-04-10'),
 (5, 'Magdalena', 'Kamińska', 'Wrocław', 'magda.k@gmail.com', '2024-05-02'),
 (6, 'Michał', 'Lewandowski', 'Warszawa', 'michal.lew@outlook.com', '2024-06-18'),
 (7, 'Agnieszka', 'Zielińska', 'Poznań', NULL, '2024-07-07'),
 (8, 'Jakub', 'Szymański', 'Kraków', 'kuba.szym@wp.pl', '2024-08-25'),
 (9, 'Natalia', 'Dąbrowska', 'Łódź', 'natalia.d@gmail.com', '2024-09-30'),
 (10, 'Kamil', 'Kozłowski', 'Gdańsk', 'kamil.koz@onet.pl', '2024-10-12');

INSERT INTO zamowienia (id, klient_id, data, status) VALUES
 (1, 1, '2025-01-10', 'zrealizowane'),
 (2, 2, '2025-01-12', 'zrealizowane'),
 (3, 1, '2025-02-05', 'zrealizowane'),
 (4, 4, '2025-02-20', 'anulowane'),
 (5, 5, '2025-03-01', 'w realizacji'),
 (6, 3, '2025-03-15', 'zrealizowane'),
 (7, 8, '2025-04-02', 'nowe'),
 (8, 6, '2025-04-11', 'zrealizowane'),
 (9, 2, '2025-05-05', 'w realizacji'),
 (10, 9, '2025-05-20', 'nowe');

INSERT INTO pozycje (id, zamowienie_id, produkt_id, ilosc) VALUES
 (1, 1, 1, 1), (2, 1, 7, 1), (3, 1, 10, 2),
 (4, 2, 4, 1), (5, 2, 9, 1),
 (6, 3, 13, 2), (7, 3, 14, 2),
 (8, 4, 6, 1),
 (9, 5, 11, 2), (10, 5, 8, 1),
 (11, 6, 3, 1), (12, 6, 7, 1),
 (13, 7, 5, 1), (14, 7, 10, 3),
 (15, 8, 2, 1), (16, 8, 12, 1), (17, 8, 8, 1),
 (18, 9, 15, 1),
 (19, 10, 9, 2);
