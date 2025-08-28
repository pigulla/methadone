import { StreamEvent } from './stream.event-name.js'

export class StreamStoppedEvent {
  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Disable structural typing.
  readonly #brand = Symbol(StreamStoppedEvent.name)

  public readonly name = StreamEvent.STOPPED
}
