import { z } from 'zod'

import { idSchema } from './id.schema.js'
import { keySchema } from './key.schema.js'

export const networkIdSchema = idSchema.brand('network-id')
export type NetworkID = z.infer<typeof networkIdSchema>

export function asNetworkID(value: number): NetworkID {
  return networkIdSchema.parse(value)
}

export const networkKeySchema = keySchema.brand('network-key')
export type NetworkKey = z.infer<typeof networkKeySchema>

export function asNetworkKey(value: unknown): NetworkKey {
  return networkKeySchema.parse(value)
}
