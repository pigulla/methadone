SELECT
    id,
    network_id,
    `key`,
    name,
    title,
    text,
    created_at,
    updated_at,
    (
        SELECT
            JSON_GROUP_ARRAY(channel_id)
        FROM
            channel_filters_channels
        WHERE
            channel_filters_channels.channel_filter_id = channel_filters.id
    ) AS channel_ids
FROM
    channel_filters
WHERE
    network_id = ?
ORDER BY
    id ASC;
