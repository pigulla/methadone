import z from 'zod'

import { StreamEvent } from './stream.event-name.js'

const optionsSchema = z.strictObject({
  track: z.string(),
})

export class StreamNewTrackEvent {
  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Disable structural typing.
  readonly #brand = Symbol(StreamNewTrackEvent.name)

  public readonly name = StreamEvent.NEW_TRACK
  public readonly track: string

  public constructor(options: { track: string }) {
    const { track } = optionsSchema.parse(options)

    this.track = track
  }
}
