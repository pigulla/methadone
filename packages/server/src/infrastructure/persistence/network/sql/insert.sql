INSERT INTO
  networks (id, key, name, url, listen_url)
VALUES
  ($id, $key, $name, $url, $listen_url)
RETURNING
  id,
  key,
  name,
  url,
  listen_url;