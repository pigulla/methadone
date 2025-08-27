INSERT OR REPLACE INTO
  currently_playing (channel_id, artist, title, started_at, duration)
VALUES
  (
    $channel_id,
    $artist,
    $title,
    $started_at,
    $duration
  )
RETURNING
  channel_id,
  artist,
  title,
  started_at,
  duration;