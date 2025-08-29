import z from 'zod'

const optionsSchema = z.strictObject({
  track: z.string(),
})

export class StreamTrackEvent {
  public static readonly NAME = 'stream.track'

  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Disable structural typing.
  readonly #brand = Symbol(StreamTrackEvent.name)

  public readonly name = StreamTrackEvent.NAME
  public readonly track: string

  public constructor(options: { track: string }) {
    const { track } = optionsSchema.loose().parse(options)

    this.track = track
  }
}
