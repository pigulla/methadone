import { networkIdSchema, networkKeySchema } from '@digitally-exported/types'

import z from 'zod'

import { Network } from '#domain/network/network.js'

export const networksRow = z
  .strictObject({
    id: networkIdSchema,
    key: networkKeySchema,
    name: z.string(),
    url: z.httpUrl(),
    listen_url: z.httpUrl(),
  })
  .transform(data => ({
    ...data,
    toDomain: () => new Network({ ...data, listenUrl: data.listen_url }),
  }))
  .readonly()
  .brand('networks-row')
