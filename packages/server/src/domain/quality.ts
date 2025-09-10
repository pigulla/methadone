export const QUALITY = {
  MP3_EXCELLENT: 'mp3-excellent',
  AAC_GOOD: 'aac-good',
  AAC_EXCELLENT: 'aac-excellent',
} as const

export type Quality = (typeof QUALITY)[keyof typeof QUALITY]
