CREATE TABLE
    channels (
        id INTEGER PRIMARY KEY NOT NULL,
        network_id INTEGER NOT NULL REFERENCES networks,
        `key` TEXT NOT NULL,
        name TEXT NOT NULL,
        UNIQUE (`key`, network_id)
    ) WITHOUT ROWID;


CREATE TABLE
    similar_channels (
        channel_id INTEGER REFERENCES channels,
        similar_channel_id INTEGER REFERENCES channels DEFERRABLE INITIALLY DEFERRED,
        PRIMARY KEY (channel_id, similar_channel_id)
    ) WITHOUT ROWID;
