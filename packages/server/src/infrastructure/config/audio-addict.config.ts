import dayjs from 'dayjs'
import { z } from 'zod'

import { QUALITY } from '#domain/quality.js'

export const AUDIO_ADDICT_CONFIG = Symbol('audio-addict-config')

export const audioAddictConfig = z
  .strictObject({
    baseUrl: z.httpUrl(),
    listenKey: z.string().regex(/^[a-z0-9]{16}$/),
    quality: z.enum(QUALITY),
    currentlyPlayingRefreshIntervalInSeconds: z
      .number()
      .positive()
      .transform(value => dayjs.duration(value, 'seconds')),
    cache: z.boolean(),
  })
  .transform(value => {
    const { currentlyPlayingRefreshIntervalInSeconds, ...others } = value
    return { ...others, currentlyPlayingRefreshInterval: currentlyPlayingRefreshIntervalInSeconds }
  })
  .readonly()
  .brand('application-config')

export type AudioAddictConfig = z.infer<typeof audioAddictConfig>
