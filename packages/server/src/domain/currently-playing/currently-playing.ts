import dayjs, { type ConfigType, type Dayjs } from 'dayjs'
import type { Duration, DurationUnitType } from 'dayjs/plugin/duration.js'
import type { JsonObject } from 'type-fest'

import { currentlyPlayingSchema } from './currently-playing.schema.js'

export class CurrentlyPlaying {
  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Disable structural typing.
  readonly #brand = Symbol(CurrentlyPlaying.name)

  public readonly artist: string
  public readonly title: string
  public readonly startedAt: Dayjs
  public readonly duration: Duration

  public constructor(data: {
    artist: string
    title: string
    startedAt: Dayjs
    duration: Duration
  }) {
    const { artist, title, startedAt, duration } = currentlyPlayingSchema.parse(data)

    this.artist = artist
    this.title = title
    this.startedAt = startedAt
    this.duration = duration
  }

  public static create({
    artist,
    title,
    startedAt,
    duration,
  }: {
    artist: string
    title: string
    startedAt: ConfigType
    duration: [number, DurationUnitType] | Duration
  }): CurrentlyPlaying {
    return new CurrentlyPlaying({
      artist,
      title,
      startedAt: dayjs(startedAt),
      duration: Array.isArray(duration) ? dayjs.duration(duration[0], duration[1]) : duration,
    })
  }

  public toJSON(): JsonObject {
    return {
      artist: this.artist,
      title: this.title,
      startedAt: this.startedAt.toISOString(),
      duration: this.duration.asSeconds(),
    }
  }
}
