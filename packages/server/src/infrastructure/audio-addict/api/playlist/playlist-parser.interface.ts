import type { PlaylistEntry } from './playlist-entry.js'

export abstract class IPlaylistParser {
  public abstract parse(input: string): PlaylistEntry[]
}
