SELECT
  id,
  key,
  name,
  url,
  listen_url
FROM
  networks
WHERE
  key = $1;