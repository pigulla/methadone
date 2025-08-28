export const StreamEvent = {
  STARTED: 'stream.started',
  STOPPED: 'stream.stopped',
  NEW_TRACK: 'stream.new-track',
} as const

export type StreamEventName = (typeof StreamEvent)[keyof typeof StreamEvent]
