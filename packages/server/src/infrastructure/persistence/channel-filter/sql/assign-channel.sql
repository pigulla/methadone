INSERT INTO
  channels_to_channel_filters (channel_id, channel_filter_id)
VALUES
  ($1, $2)
RETURNING
  channel_id,
  channel_filter_id;