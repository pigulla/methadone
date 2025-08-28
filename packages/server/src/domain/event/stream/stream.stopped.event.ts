export class StreamStoppedEvent {
  public static readonly NAME = 'stream.stopped'

  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Disable structural typing.
  readonly #brand = Symbol(StreamStoppedEvent.name)

  public readonly name = StreamStoppedEvent.NAME
}
