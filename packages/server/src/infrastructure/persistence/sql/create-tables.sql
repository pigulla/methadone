CREATE TABLE networks (
  id INTEGER PRIMARY KEY NOT NULL CHECK (id > 0),
  key VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  url VARCHAR NOT NULL,
  listen_url VARCHAR NOT NULL
);

CREATE TABLE channels (
  id INTEGER PRIMARY KEY NOT NULL CHECK (id > 0),
  network_id INTEGER REFERENCES networks (id) NOT NULL,
  key VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  description VARCHAR NOT NULL,
  director VARCHAR NOT NULL,
  UNIQUE (network_id, key)
);

CREATE TABLE similar_channels (
  channel_id INTEGER REFERENCES channels (id) NOT NULL,
  similar_channel_id INTEGER REFERENCES channels (id) DEFERRABLE INITIALLY IMMEDIATE CHECK (channel_id <> similar_channel_id) NOT NULL,
  PRIMARY KEY (channel_id, similar_channel_id)
);

CREATE TABLE channel_filters (
  id INTEGER PRIMARY KEY NOT NULL CHECK (id > 0),
  network_id INTEGER REFERENCES networks (id) NOT NULL,
  key VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  position INTEGER NOT NULL,
  UNIQUE (id, position),
  UNIQUE (network_id, key)
);

CREATE TABLE channels_to_channel_filters (
  channel_id INTEGER REFERENCES channels (id) NOT NULL,
  channel_filter_id INTEGER REFERENCES channel_filters (id) NOT NULL,
  PRIMARY KEY (channel_id, channel_filter_id)
);

CREATE TABLE currently_playing (
  channel_id INTEGER REFERENCES channels (id) PRIMARY KEY NOT NULL,
  artist VARCHAR NULL,
  title VARCHAR NULL,
  started_at TIMESTAMPTZ NULL,
  duration INTERVAL NULL,
  CHECK (
    (
      artist IS NULL
      AND title IS NULL
      AND started_at IS NULL
      AND duration IS NULL
    )
    OR (
      artist IS NOT NULL
      AND title IS NOT NULL
      AND started_at IS NOT NULL
      AND duration IS NOT NULL
    )
  )
);

CREATE VIEW view_channels AS
SELECT
  channels.id,
  channels.network_id,
  channels.key,
  channels.name,
  channels.description,
  channels.director,
  COALESCE(
    (
      SELECT
        JSON_AGG (similar_channels.similar_channel_id)
      FROM
        similar_channels
      WHERE
        similar_channels.channel_id = channels.id
    ),
    '[]'::JSON
  ) AS similar_channels
FROM
  channels;
