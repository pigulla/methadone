import {
  channelFilterIdSchema,
  channelFilterKeySchema,
  channelIdSchema,
  networkIdSchema,
} from '@digitally-exported/types'

import z from 'zod'

import { ChannelFilter } from '#domain/channel-filter/channel-filter.js'

export const channelFiltersRow = z
  .strictObject({
    id: channelFilterIdSchema,
    key: channelFilterKeySchema,
    network_id: networkIdSchema,
    name: z.string(),
    position: z.number().int().min(0),
    channel_ids: z.preprocess(
      value => (typeof value === 'string' ? JSON.parse(value) : value),
      z.array(channelIdSchema),
    ),
  })
  .transform(data => ({
    ...data,
    toDomain: () =>
      new ChannelFilter({
        ...data,
        networkId: data.network_id,
        channels: new Set(data.channel_ids),
      }),
  }))
  .readonly()
  .brand('channel-filters-row')
