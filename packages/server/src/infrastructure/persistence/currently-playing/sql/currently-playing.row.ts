import { DuckDBIntervalValue } from '@duckdb/node-api/lib/values/DuckDBIntervalValue.js'
import { DuckDBTimestampTZValue } from '@duckdb/node-api/lib/values/DuckDBTimestampTZValue.js'
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
        .instanceof(DuckDBTimestampTZValue)
        .transform(value => {
          const { date, time } = value.toParts()
          return dayjs({
            ...date,
            hour: time.hour,
            minute: time.min,
            second: time.sec,
          })
        })
        .refine(value => value.isValid()),
      duration: z
        .instanceof(DuckDBIntervalValue)
        .transform(value => dayjs.duration(Number(value.micros / 1000000n), 'seconds')),
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
