import dayjs from 'dayjs'
import z from 'zod'

import { channelIdSchema } from '#domain/channel/channel.schema.js'
import { CurrentlyPlaying } from '#domain/currently-playing/currently-playing.js'

export const currentlyPlayingRow = z
  .union([
    z.strictObject({
      channel_id: channelIdSchema,
      artist: z.string(),
      title: z.string(),
      started_at: z
        .instanceof(Date)
        .transform(value => dayjs(value))
        .refine(value => value.isValid()),
      duration: z
        .number()
        .int()
        .min(0)
        .transform(value => dayjs.duration(value, 'seconds')),
    }),
    z.strictObject({
      channel_id: channelIdSchema,
      artist: z.null(),
      title: z.null(),
      started_at: z.null(),
      duration: z.null(),
    }),
  ])
  .transform(data => ({
    ...data,
    toDomain: () =>
      data.artist === null
        ? null
        : new CurrentlyPlaying({
            ...data,
            startedAt: data.started_at,
          }),
  }))
  .readonly()
  .brand('currently-playing-row')
