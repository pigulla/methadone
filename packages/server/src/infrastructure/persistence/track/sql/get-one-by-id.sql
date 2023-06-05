SELECT
    id,
    `length`,
    title,
    artist_id,
    version,
    asset_url
FROM
    tracks
WHERE
    id = ?;
