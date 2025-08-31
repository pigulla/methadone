INSERT INTO
  channels (id, key, network_id, name, description, director)
VALUES
  ($1, $2, $3, $4, $5, $6)
RETURNING
  id,
  key,
  network_id,
  name,
  description,
  director;