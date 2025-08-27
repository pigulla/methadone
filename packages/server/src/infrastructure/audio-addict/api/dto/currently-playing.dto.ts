import { keySchema } from '@methadone/dto/key.schema.js'

import z from 'zod'

import { idSchema } from './id.schema.js'
import { isoDateSchema } from './iso-date.schema.js'

export const currentlyPlayingDtoSchema = z.array(
  z.object({
    channel_id: idSchema,
    channel_key: keySchema,
    track: z.strictObject({
      id: idSchema,
      display_artist: z.string(),
      display_title: z.string(),
      start_time: isoDateSchema,
      duration: z.number().min(0),
    }),
  }),
)
