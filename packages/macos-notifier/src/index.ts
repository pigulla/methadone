/** biome-ignore-all lint/suspicious/noConsole: Still a WIP */

import { type ChannelDTO, eventSchema, type NetworkDTO } from '@methadone/dto/'

import { createEventSource, type EventSourceMessage } from 'eventsource-client'
import { execaSync } from 'execa'

let network: NetworkDTO | null = null
let channel: ChannelDTO | null = null
let track: string | null = null

const eventSource = createEventSource({
  url: 'http://localhost:3000/sse',
  onConnect(): void {
    console.warn('CONNECTED')
  },
  onDisconnect(): void {
    console.warn('DISCONNECTED')
    network = null
    channel = null
    track = null
  },
  onMessage(message: EventSourceMessage) {
    console.warn(message.event)
    const event = eventSchema.parse(message)
    let hasTrackChanged = false

    switch (event.event) {
      case 'stream.playing':
      case 'stream.started':
        network = event.data.network
        channel = event.data.channel
        break
      case 'stream.stopped':
        network = null
        channel = null
        break
      case 'stream.track':
        if (event.data.track !== track) {
          track = event.data.track
          hasTrackChanged = true
        }
        break
    }

    if (hasTrackChanged && track !== null && network !== null && channel !== null) {
      console.info(`${track} (${channel.name} on ${network.name})`)
      execaSync('osascript', [
        '-e',
        `display notification ${JSON.stringify(track)} with title ${JSON.stringify(channel.name)} subtitle ${JSON.stringify(network.name)})`,
      ])
    }
  },
})

process.on('SIGINT', () => {
  eventSource.close()
})
