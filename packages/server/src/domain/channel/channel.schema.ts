import { channelIdSchema, channelKeySchema, networkIdSchema } from '@methadone/types'

import z from 'zod'

export const channelSchema = z
  .strictObject({
    id: channelIdSchema,
    key: channelKeySchema,
    networkId: networkIdSchema,
    name: z.string().min(1),
    director: z.string(),
    description: z.string(),
    similar: z.set(channelIdSchema).readonly(),
  })
  .brand('channel')
