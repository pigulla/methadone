SELECT
  channel_id,
  artist,
  title,
  started_at,
  EXTRACT (
    EPOCH
    FROM
      duration
  )::INTEGER AS duration
FROM
  currently_playing
WHERE
  channel_id = $1;
