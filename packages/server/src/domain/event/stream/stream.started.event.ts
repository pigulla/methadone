import z from 'zod'

import { Channel } from '#domain/channel/channel.js'
import { Network } from '#domain/network/network.js'

const optionsSchema = z.strictObject({
  network: z.instanceof(Network),
  channel: z.instanceof(Channel),
})

export class StreamStartedEvent {
  public static readonly NAME = 'stream.started'

  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Disable structural typing.
  readonly #brand = Symbol(StreamStartedEvent.name)

  public readonly name = StreamStartedEvent.NAME
  public readonly network: Network
  public readonly channel: Channel

  public constructor(options: { network: Network; channel: Channel }) {
    const { network, channel } = optionsSchema.parse(options)

    this.network = network
    this.channel = channel
  }
}
