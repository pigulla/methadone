import dayjs from 'dayjs'
import { z } from 'zod'

import { AUDIO_FORMAT } from '#domain/audio-format.js'

export const AUDIO_ADDICT_CONFIG = Symbol('audio-addict-config')

export const audioAddictConfig = z
  .strictObject({
    baseUrl: z.httpUrl(),
    listeningKey: z.string().regex(/^[a-z0-9]{16}$/),
    format: z.enum(AUDIO_FORMAT),
    currentlyPlayingRefreshIntervalInSeconds: z
      .number()
      .positive()
      .transform(value => dayjs.duration(value, 'seconds')),
  })
  .transform(value => {
    const { currentlyPlayingRefreshIntervalInSeconds, ...others } = value
    return { ...others, currentlyPlayingRefreshInterval: currentlyPlayingRefreshIntervalInSeconds }
  })
  .readonly()
  .brand('application-config')

export type AudioAddictConfig = z.infer<typeof audioAddictConfig>
