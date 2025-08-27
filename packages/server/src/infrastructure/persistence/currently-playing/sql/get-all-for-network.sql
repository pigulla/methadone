SELECT
  currently_playing.channel_id,
  currently_playing.artist,
  currently_playing.title,
  currently_playing.started_at,
  currently_playing.duration
FROM
  currently_playing
  JOIN channels ON channels.id = currently_playing.channel_id
  AND channels.network_id = $network_id