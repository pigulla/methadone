import { parse } from 'ini'
import z from 'zod'

import {
  type PlaylistEntry,
  playlistEntrySchema,
} from '#infrastructure/audio-addict/api/playlist/playlist-entry.js'

import type { IPlaylistParser } from './playlist-parser.interface.js'

const playlistSchema = z.strictObject({
  playlist: z
    .looseObject({
      Version: z.literal('2'),
      NumberOfEntries: z.coerce.number().int().min(0),
    })
    .catchall(z.string()),
})

function entrySchema(index: number) {
  return z
    .looseObject({
      [`File${index}`]: z.httpUrl(),
      [`Length${index}`]: z.coerce.number().int().min(-1).optional(),
      [`Title${index}`]: z.string().optional(),
    })
    .transform(data =>
      playlistEntrySchema.parse({
        file: data[`File${index}`],
        length: data[`Length${index}`],
        title: data[`Title${index}`],
      }),
    )
}

export class PlaylistParser implements IPlaylistParser {
  public parse(input: string): PlaylistEntry[] {
    const result: PlaylistEntry[] = []
    const object = parse(input)
    const { playlist } = playlistSchema.parse(object)

    for (let i = 1; i <= playlist.NumberOfEntries; i++) {
      const entry = entrySchema(i).parse(playlist)
      result.push(entry)
    }

    return result
  }
}
