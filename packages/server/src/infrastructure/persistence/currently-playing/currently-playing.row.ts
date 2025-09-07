import { channelIdSchema } from '@methadone/types'

import dayjs, { type Dayjs } from 'dayjs'
import type { Duration } from 'dayjs/plugin/duration.js'
import z from 'zod'

import { CurrentlyPlaying } from '#domain/currently-playing/currently-playing.js'

export const currentlyPlayingRow = z
  .union([
    z.strictObject({
      channel_id: channelIdSchema,
      artist: z.string(),
      title: z.string(),
      started_at: z.custom<Dayjs>(value => dayjs.isDayjs(value)).refine(value => value.isValid()),
      duration: z
        .custom<Duration>(value => dayjs.isDuration(value))
        .refine(value => value.asSeconds() >= 0),
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
