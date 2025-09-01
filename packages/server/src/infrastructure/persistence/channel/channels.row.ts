import z from 'zod'

import { Channel } from '#domain/channel/channel.js'
import { channelIdSchema, channelKeySchema } from '#domain/channel/channel.schema.js'
import { networkIdSchema } from '#domain/network/network.schema.js'

export const channelsViewRow = z
  .strictObject({
    id: channelIdSchema,
    key: channelKeySchema,
    network_id: networkIdSchema,
    name: z.string(),
    description: z.string(),
    director: z.string(),
    similar_channels: z.preprocess(
      value => (typeof value === 'string' ? JSON.parse(value) : value),
      z.array(channelIdSchema),
    ),
  })
  .transform(data => ({
    ...data,
    toDomain: () =>
      new Channel({ ...data, networkId: data.network_id, similar: new Set(data.similar_channels) }),
  }))
  .readonly()
  .brand('channels-view-row')
