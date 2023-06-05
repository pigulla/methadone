CREATE TABLE
    channel_filters (
        id INTEGER PRIMARY KEY NOT NULL,
        network_id INTEGER NOT NULL REFERENCES networks,
        `key` TEXT NOT NULL,
        name TEXT NOT NULL,
        title TEXT,
        `text` TEXT,
        created_at TEXT,
        updated_at TEXT,
        director TEXT,
        UNIQUE (`key`, network_id)
    ) WITHOUT ROWID;


CREATE TABLE
    channel_filters_channels (
        channel_filter_id INTEGER REFERENCES channel_filters,
        channel_id INTEGER REFERENCES channels,
        PRIMARY KEY (channel_filter_id, channel_id)
    ) WITHOUT ROWID;
