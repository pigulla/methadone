import { networkIdSchema, networkKeySchema } from '@methadone/types'

import z from 'zod'

import { isoDateSchema } from './iso-date.schema.js'
import { sanitizeString } from './sanitize-string.js'

const networkDtoSchema = z.object({
  id: networkIdSchema,
  name: z.string().min(1).pipe(sanitizeString),
  key: networkKeySchema,
  url: z.httpUrl(),
  description: z.string().pipe(sanitizeString).nullable(),
  created_at: isoDateSchema,
  updated_at: isoDateSchema,
  active: z.boolean(),
  listen_url: z.httpUrl(),
  service_key: z.string().pipe(sanitizeString),
  active_channel_count: z.number().int().positive(),
})

export const networksDtoSchema = z.array(networkDtoSchema)
