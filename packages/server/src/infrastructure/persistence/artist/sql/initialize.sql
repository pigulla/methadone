CREATE TABLE
    artists (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        bio_short TEXT,
        bio_long TEXT,
        created_at TEXT NOT NULL
    ) WITHOUT ROWID;
