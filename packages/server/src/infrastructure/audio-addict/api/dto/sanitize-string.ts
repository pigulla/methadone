import z from 'zod'

export const sanitizeString = z.transform<string, string>(value =>
  value
    // biome-ignore lint/suspicious/noControlCharactersInRegex: This is intentional
    .replace(/\u{00}/gu, '')
    .trim(),
)
