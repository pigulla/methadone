import { QUALITY, type Quality } from '#domain/quality.js'

// There actually is an endpoint to retrieve the available qualities (https://api.audioaddict.com/v1/di/qualities).
// However, it is not clear how the data returned from there maps onto the actual URLs (specifically the suffixes) for
// the streams :-/

export const qualitySuffixMapping: Record<Quality, string> = {
  [QUALITY.AAC_GOOD]: '_medium',
  [QUALITY.AAC_EXCELLENT]: '',
  [QUALITY.MP3_EXCELLENT]: '_high',
}
