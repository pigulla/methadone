import dayjs from 'dayjs'
import z from 'zod'

import { channelIdSchema } from '#domain/channel/channel.schema.js'
import { CurrentlyPlaying } from '#domain/currently-playing/currently-playing.js'

export const currentlyPlayingRow = z
  .strictObject({
    channel_id: channelIdSchema,
    artist: z.string(),
    title: z.httpUrl(),
    started_at: z.string(),
    duration: z.number(),
  })
  .transform(data => ({
    ...data,
    toDomain: () => {
      const { channel_id, started_at, duration, ...other } = data
      return new CurrentlyPlaying({
        ...other,
        channelId: channel_id,
        startedAt: dayjs(started_at),
        duration: dayjs.duration(duration, 'seconds'),
      })
    },
  }))
  .readonly()
  .brand('currently-playing-row')

export type NetworksRow = z.infer<typeof currentlyPlayingRow>
