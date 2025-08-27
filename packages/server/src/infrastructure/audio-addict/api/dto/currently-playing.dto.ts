import z from 'zod'

import { channelIdSchema, channelKeySchema } from '#domain/channel/channel.schema.js'

import { idSchema } from './id.schema.js'
import { isoDateSchema } from './iso-date.schema.js'

export const currentlyPlayingDtoSchema = z.array(
  z.object({
    channel_id: channelIdSchema,
    channel_key: channelKeySchema,
    track: z
      .strictObject({
        id: idSchema,
        display_artist: z.string(),
        display_title: z.string(),
        start_time: isoDateSchema,
        duration: z.number().min(0),
      })
      .nullable(),
  }),
)
