import type { StreamStartedEvent } from './stream.started.event.js'
import type { StreamStoppedEvent } from './stream.stopped.event.js'
import type { StreamTrackEvent } from './stream.track.event.js'

export type StreamEvent = StreamStartedEvent | StreamStoppedEvent | StreamTrackEvent
