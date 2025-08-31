INSERT INTO
  networks (id, key, name, url, listen_url)
VALUES
  ($1, $2, $3, $4, $5)
RETURNING
  id,
  key,
  name,
  url,
  listen_url;