INSERT INTO
    tracks (id, `length`, title, artist_id, version, asset_url)
VALUES
    (?, ?, ?, ?, ?, ?)
ON CONFLICT DO NOTHING;
