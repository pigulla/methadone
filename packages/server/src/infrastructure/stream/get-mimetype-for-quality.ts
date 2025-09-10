import { QUALITY, type Quality } from '#domain/quality.js'

export function getMimetypeForQuality(quality: Quality): string {
  switch (quality) {
    case QUALITY.MP3_EXCELLENT:
      return 'audio/mpeg'
    case QUALITY.AAC_GOOD:
      return 'audio/aac'
    case QUALITY.AAC_EXCELLENT:
      return 'audio/aac'
    default:
      throw new Error(`Unexpected quality value: ${quality}`)
  }
}
