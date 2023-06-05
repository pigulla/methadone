CREATE TABLE
    tracks (
        id INTEGER PRIMARY KEY NOT NULL,
        `length` INTEGER,
        title TEXT NOT NULL,
        artist_id INTEGER NOT NULL REFERENCES artists,
        version TEXT,
        asset_url TEXT
    ) WITHOUT ROWID;
