UPDATE channels
SET
  network_id = $network_id,
  key = $key,
  name = $name,
  description = $description,
  director = $director
WHERE
  id = $id;