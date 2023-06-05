SELECT
    id,
    network_id,
    `key`,
    name,
    (
        SELECT
            JSON_GROUP_ARRAY(similar_channel_id)
        FROM
            similar_channels
        WHERE
            similar_channels.channel_id = channels.id
    ) AS similar_channel_ids
FROM
    channels
ORDER BY
    id ASC;
