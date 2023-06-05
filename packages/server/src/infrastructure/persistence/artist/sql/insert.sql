INSERT INTO
    artists (id, name, bio_short, bio_long, created_at)
VALUES
    (?, ?, ?, ?, ?)
ON CONFLICT DO NOTHING;
