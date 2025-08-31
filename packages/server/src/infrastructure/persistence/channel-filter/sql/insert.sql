INSERT INTO
  channel_filters (id, key, network_id, name, position)
VALUES
  ($1, $2, $3, $4, $5)
RETURNING
  id,
  key,
  network_id,
  name,
  position;