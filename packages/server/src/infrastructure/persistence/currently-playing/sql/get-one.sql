SELECT
  channel_id,
  artist,
  title,
  started_at,
  duration
FROM
  currently_playing
WHERE
  channel_id = $1;