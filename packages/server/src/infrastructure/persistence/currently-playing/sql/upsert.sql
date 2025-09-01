INSERT INTO
  currently_playing (channel_id, artist, title, started_at, duration)
VALUES
  ($1, $2, $3, $4, $5)
ON CONFLICT (channel_id) DO
UPDATE
SET
  artist = excluded.artist,
  title = excluded.title,
  started_at = excluded.started_at,
  duration = excluded.duration
RETURNING
  channel_id,
  artist,
  title,
  started_at,
  EXTRACT (
    EPOCH
    FROM
      duration
  )::INTEGER AS duration;