SELECT
    id,
    name,
    bio_short,
    bio_long,
    created_at
FROM
    artists
WHERE
    id = ?;
