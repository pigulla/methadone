CREATE TABLE
    networks (
        id INTEGER PRIMARY KEY NOT NULL,
        `key` TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        url TEXT NOT NULL
    ) WITHOUT ROWID;
