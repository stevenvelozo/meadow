-- Bookstore Schema and Seed Data for Meadow Tests
-- Generated from meadow-connection-mysql/retold-harness/model/sql_create/BookStore-CreateDatabase.mysql.sql
-- and the first 20 rows of meadow-connection-mysql/retold-harness/data/books.csv

-- Schema

CREATE TABLE IF NOT EXISTS
    Book
    (
        IDBook INT UNSIGNED NOT NULL AUTO_INCREMENT,
        GUIDBook CHAR(36) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
        CreateDate DATETIME,
        CreatingIDUser INT NOT NULL DEFAULT '0',
        UpdateDate DATETIME,
        UpdatingIDUser INT NOT NULL DEFAULT '0',
        Deleted TINYINT NOT NULL DEFAULT '0',
        DeleteDate DATETIME,
        DeletingIDUser INT NOT NULL DEFAULT '0',
        Title CHAR(200) NOT NULL DEFAULT '',
        Type CHAR(32) NOT NULL DEFAULT '',
        Genre CHAR(128) NOT NULL DEFAULT '',
        ISBN CHAR(64) NOT NULL DEFAULT '',
        Language CHAR(12) NOT NULL DEFAULT '',
        ImageURL CHAR(254) NOT NULL DEFAULT '',
        PublicationYear INT NOT NULL DEFAULT '0',

        PRIMARY KEY (IDBook)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS
    BookAuthorJoin
    (
        IDBookAuthorJoin INT UNSIGNED NOT NULL AUTO_INCREMENT,
        GUIDBookAuthorJoin CHAR(36) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
        IDBook INT NOT NULL DEFAULT '0',
        IDAuthor INT NOT NULL DEFAULT '0',

        PRIMARY KEY (IDBookAuthorJoin)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS
    Author
    (
        IDAuthor INT UNSIGNED NOT NULL AUTO_INCREMENT,
        GUIDAuthor CHAR(36) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
        CreateDate DATETIME,
        CreatingIDUser INT NOT NULL DEFAULT '0',
        UpdateDate DATETIME,
        UpdatingIDUser INT NOT NULL DEFAULT '0',
        Deleted TINYINT NOT NULL DEFAULT '0',
        DeleteDate DATETIME,
        DeletingIDUser INT NOT NULL DEFAULT '0',
        Name CHAR(200) NOT NULL DEFAULT '',

        PRIMARY KEY (IDAuthor)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS
    BookPrice
    (
        IDBookPrice INT UNSIGNED NOT NULL AUTO_INCREMENT,
        GUIDBookPrice CHAR(36) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
        CreateDate DATETIME,
        CreatingIDUser INT NOT NULL DEFAULT '0',
        UpdateDate DATETIME,
        UpdatingIDUser INT NOT NULL DEFAULT '0',
        Deleted TINYINT NOT NULL DEFAULT '0',
        DeleteDate DATETIME,
        DeletingIDUser INT NOT NULL DEFAULT '0',
        Price DECIMAL(8,2),
        StartDate DATETIME,
        EndDate DATETIME,
        Discountable TINYINT NOT NULL DEFAULT '0',
        CouponCode CHAR(16) NOT NULL DEFAULT '',
        IDBook INT NOT NULL DEFAULT '0',

        PRIMARY KEY (IDBookPrice)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS
    Review
    (
        IDReviews INT UNSIGNED NOT NULL AUTO_INCREMENT,
        GUIDReviews CHAR(36) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
        CreateDate DATETIME,
        CreatingIDUser INT NOT NULL DEFAULT '0',
        UpdateDate DATETIME,
        UpdatingIDUser INT NOT NULL DEFAULT '0',
        Deleted TINYINT NOT NULL DEFAULT '0',
        DeleteDate DATETIME,
        DeletingIDUser INT NOT NULL DEFAULT '0',
        Text TEXT,
        Rating INT NOT NULL DEFAULT '0',
        IDBook INT NOT NULL DEFAULT '0',

        PRIMARY KEY (IDReviews)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data: First 20 books from books.csv
-- Inserted in CSV order so IDBook matches CSV row number

INSERT INTO Book (Title, Type, Genre, ISBN, Language, ImageURL, PublicationYear, CreateDate, CreatingIDUser, UpdateDate, UpdatingIDUser) VALUES
('The Hunger Games', 'Paper', 'UNKNOWN', '439023483', 'eng', 'https://images.gr-assets.com/books/1447303603m/2767052.jpg', 2008, NOW(), 99999, NOW(), 99999),
('Harry Potter and the Philosopher''s Stone', 'Paper', 'UNKNOWN', '439554934', 'eng', 'https://images.gr-assets.com/books/1474154022m/3.jpg', 1997, NOW(), 99999, NOW(), 99999),
('Twilight', 'Paper', 'UNKNOWN', '316015849', 'en-US', 'https://images.gr-assets.com/books/1361039443m/41865.jpg', 2005, NOW(), 99999, NOW(), 99999),
('To Kill a Mockingbird', 'Paper', 'UNKNOWN', '61120081', 'eng', 'https://images.gr-assets.com/books/1361975680m/2657.jpg', 1960, NOW(), 99999, NOW(), 99999),
('The Great Gatsby', 'Paper', 'UNKNOWN', '743273567', 'eng', 'https://images.gr-assets.com/books/1490528560m/4671.jpg', 1925, NOW(), 99999, NOW(), 99999),
('The Fault in Our Stars', 'Paper', 'UNKNOWN', '525478817', 'eng', 'https://images.gr-assets.com/books/1360206420m/11870085.jpg', 2012, NOW(), 99999, NOW(), 99999),
('The Hobbit or There and Back Again', 'Paper', 'UNKNOWN', '618260307', 'en-US', 'https://images.gr-assets.com/books/1372847500m/5907.jpg', 1937, NOW(), 99999, NOW(), 99999),
('The Catcher in the Rye', 'Paper', 'UNKNOWN', '316769177', 'eng', 'https://images.gr-assets.com/books/1398034300m/5107.jpg', 1951, NOW(), 99999, NOW(), 99999),
('Angels & Demons', 'Paper', 'UNKNOWN', '1416524797', 'en-CA', 'https://images.gr-assets.com/books/1303390735m/960.jpg', 2000, NOW(), 99999, NOW(), 99999),
('Pride and Prejudice', 'Paper', 'UNKNOWN', '679783261', 'eng', 'https://images.gr-assets.com/books/1320399351m/1885.jpg', 1813, NOW(), 99999, NOW(), 99999),
('The Kite Runner', 'Paper', 'UNKNOWN', '1594480001', 'eng', 'https://images.gr-assets.com/books/1484565687m/77203.jpg', 2003, NOW(), 99999, NOW(), 99999),
('Divergent', 'Paper', 'UNKNOWN', '62024035', 'eng', 'https://images.gr-assets.com/books/1328559506m/13335037.jpg', 2011, NOW(), 99999, NOW(), 99999),
('Nineteen Eighty-Four', 'Paper', 'UNKNOWN', '451524934', 'eng', 'https://images.gr-assets.com/books/1348990566m/5470.jpg', 1949, NOW(), 99999, NOW(), 99999),
('Animal Farm: A Fairy Story', 'Paper', 'UNKNOWN', '452284244', 'eng', 'https://images.gr-assets.com/books/1424037542m/7613.jpg', 1945, NOW(), 99999, NOW(), 99999),
('Het Achterhuis: Dagboekbrieven 14 juni 1942 - 1 augustus 1944', 'Paper', 'UNKNOWN', '553296981', 'eng', 'https://images.gr-assets.com/books/1358276407m/48855.jpg', 1947, NOW(), 99999, NOW(), 99999),
('Män som hatar kvinnor', 'Paper', 'UNKNOWN', '307269752', 'eng', 'https://images.gr-assets.com/books/1327868566m/2429135.jpg', 2005, NOW(), 99999, NOW(), 99999),
('Catching Fire', 'Paper', 'UNKNOWN', '439023491', 'eng', 'https://images.gr-assets.com/books/1358273780m/6148028.jpg', 2009, NOW(), 99999, NOW(), 99999),
('Harry Potter and the Prisoner of Azkaban', 'Paper', 'UNKNOWN', '043965548X', 'eng', 'https://images.gr-assets.com/books/1499277281m/5.jpg', 1999, NOW(), 99999, NOW(), 99999),
('The Fellowship of the Ring', 'Paper', 'UNKNOWN', '618346252', 'eng', 'https://images.gr-assets.com/books/1298411339m/34.jpg', 1954, NOW(), 99999, NOW(), 99999),
('Mockingjay', 'Paper', 'UNKNOWN', '439023513', 'eng', 'https://images.gr-assets.com/books/1358275419m/7260188.jpg', 2010, NOW(), 99999, NOW(), 99999);

-- Seed Data: Authors for the first 20 books

INSERT INTO Author (Name, CreateDate, CreatingIDUser, UpdateDate, UpdatingIDUser) VALUES
('Suzanne Collins', NOW(), 99999, NOW(), 99999),
('J.K. Rowling', NOW(), 99999, NOW(), 99999),
('Mary GrandPré', NOW(), 99999, NOW(), 99999),
('Stephenie Meyer', NOW(), 99999, NOW(), 99999),
('Harper Lee', NOW(), 99999, NOW(), 99999),
('F. Scott Fitzgerald', NOW(), 99999, NOW(), 99999),
('John Green', NOW(), 99999, NOW(), 99999),
('J.R.R. Tolkien', NOW(), 99999, NOW(), 99999),
('J.D. Salinger', NOW(), 99999, NOW(), 99999),
('Dan Brown', NOW(), 99999, NOW(), 99999),
('Jane Austen', NOW(), 99999, NOW(), 99999),
('Khaled Hosseini', NOW(), 99999, NOW(), 99999),
('Veronica Roth', NOW(), 99999, NOW(), 99999),
('George Orwell', NOW(), 99999, NOW(), 99999),
('Erich Fromm', NOW(), 99999, NOW(), 99999),
('Anne Frank', NOW(), 99999, NOW(), 99999),
('Eleanor Roosevelt', NOW(), 99999, NOW(), 99999),
('B.M. Mooyaart-Doubleday', NOW(), 99999, NOW(), 99999),
('Stieg Larsson', NOW(), 99999, NOW(), 99999),
('Reg Keeland', NOW(), 99999, NOW(), 99999),
('Rufus Beck', NOW(), 99999, NOW(), 99999);
