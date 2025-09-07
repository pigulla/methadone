import {
  channelFilterIdSchema,
  channelFilterKeySchema,
  channelIdSchema,
  networkIdSchema,
} from '@methadone/types'

import z from 'zod'

export const channelFilterSchema = z
  .strictObject({
    id: channelFilterIdSchema,
    key: channelFilterKeySchema,
    networkId: networkIdSchema,
    name: z.string().min(1),
    position: z.number().int().min(0),
    channels: z.set(channelIdSchema).readonly(),
  })
  .brand('channel-filter')
