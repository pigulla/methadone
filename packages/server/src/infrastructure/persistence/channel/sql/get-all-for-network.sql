SELECT
  id,
  key,
  network_id,
  name,
  description,
  director,
  similar_channels
FROM
  view_channels
WHERE
  network_id = $network_id;