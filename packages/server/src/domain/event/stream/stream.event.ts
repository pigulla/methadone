import { StreamNewTrackEvent } from './stream.new-track.event.js'
import type { StreamStartedEvent } from './stream.started.event.js'
import { StreamStoppedEvent } from './stream.stopped.event.js'

export type StreamEvent = StreamStartedEvent | StreamStoppedEvent | StreamNewTrackEvent
