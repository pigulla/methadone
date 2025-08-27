import dayjs, { Dayjs } from 'dayjs'
import type { Duration } from 'dayjs/plugin/duration.js'
import z from 'zod'

import { channelIdSchema } from '#domain/channel/channel.schema.js'

export const currentlyPlayingSchema = z.strictObject({
  channelId: channelIdSchema,
  artist: z.string(),
  title: z.string(),
  startedAt: z.custom<Dayjs>(value => dayjs.isDayjs(value)).refine(value => value.isValid()),
  duration: z.custom<Duration>(value => dayjs.isDuration(value)),
})
