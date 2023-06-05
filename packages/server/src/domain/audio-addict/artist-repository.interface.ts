import { type Artist, type ArtistID } from './artist'

export abstract class IArtistRepository {
    public abstract insertArtist(artist: Artist): void

    public abstract getArtist(artistId: ArtistID): Artist

    public abstract findArtist(artistId: ArtistID): Artist | null
}
