SELECT
  id,
  key,
  name,
  url,
  listen_url
FROM
  networks
WHERE
  id = $1;