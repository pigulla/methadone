import z from 'zod'

// Example of a track with unicode sequence \u0000 in it:
// https://api.audioaddict.com/v1/di/tracks/2896062

export const sanitizeString = z.transform<string, string>(value =>
  value
    // biome-ignore lint/suspicious/noControlCharactersInRegex: This is intentional
    .replace(/\u{00}/gu, '')
    .trim(),
)
