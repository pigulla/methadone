import { networkIdSchema, networkKeySchema } from '@methadone/types'

import z from 'zod'

export const networkSchema = z
  .strictObject({
    id: networkIdSchema,
    key: networkKeySchema,
    name: z.string().min(1),
    url: z.httpUrl(),
    listenUrl: z.httpUrl(),
  })
  .brand('network')
