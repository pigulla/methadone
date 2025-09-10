import { z } from 'zod'

export const EXTERNAL_PLAYER_CONFIG = Symbol('external-player-config')

export const externalPlayerConfig = z
  .strictObject({
    path: z.string().min(1),
    options: z.array(z.string()),
    probeOptions: z.array(z.string()).nullable(),
  })
  .readonly()
  .brand('external-player-config')

export type ExternalPlayerConfig = z.infer<typeof externalPlayerConfig>
