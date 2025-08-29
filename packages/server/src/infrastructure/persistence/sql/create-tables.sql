CREATE TABLE networks (
  id UINTEGER PRIMARY KEY NOT NULL,
  key VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  url VARCHAR NOT NULL,
  listen_url VARCHAR NOT NULL
);

CREATE TABLE channels (
  id UINTEGER PRIMARY KEY NOT NULL,
  network_id UINTEGER REFERENCES networks (id) NOT NULL,
  key VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  description VARCHAR NOT NULL,
  director VARCHAR NOT NULL,
  UNIQUE (network_id, key)
);

CREATE TABLE similar_channels (
  channel_id UINTEGER REFERENCES channels (id) NOT NULL,
  similar_channel_id UINTEGER CHECK (channel_id <> similar_channel_id) NOT NULL,
  PRIMARY KEY (channel_id, similar_channel_id),
);

CREATE TABLE channel_filters (
  id UINTEGER PRIMARY KEY NOT NULL,
  network_id UINTEGER REFERENCES networks (id) NOT NULL,
  key VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  position INTEGER NOT NULL,
  UNIQUE (id, position),
  UNIQUE (network_id, key)
);

CREATE TABLE channels_to_channel_filters (
  channel_id UINTEGER REFERENCES channels (id) NOT NULL,
  channel_filter_id UINTEGER REFERENCES channel_filters (id) NOT NULL,
  PRIMARY KEY (channel_id, channel_filter_id),
);

CREATE TABLE currently_playing (
  channel_id UINTEGER REFERENCES channels (id) PRIMARY KEY NOT NULL,
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
        JSON_GROUP_ARRAY(similar_channels.similar_channel_id)
      FROM
        similar_channels
        JOIN channels ON channels.id = similar_channels.channel_id
      WHERE
        similar_channels.channel_id = channels.id
    ),
    '[]'
  ) AS similar_channels
FROM
  channels;