import type { JsonObject } from 'type-fest'

import { trackSchema } from './track.schema.js'

export class Track {
  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Disable structural typing.
  readonly #brand = Symbol(Track.name)

  public readonly artist: string
  public readonly title: string

  public constructor(data: {
    artist: string
    title: string
  }) {
    const { artist, title } = trackSchema.parse(data)

    this.artist = artist
    this.title = title
  }

  public static create({ artist, title }: { artist: string; title: string }): Track {
    return new Track({
      artist,
      title,
    })
  }

  public toJSON(): JsonObject {
    return {
      artist: this.artist,
      title: this.title,
    }
  }
}
