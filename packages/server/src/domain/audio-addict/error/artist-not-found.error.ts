import { type ArtistID } from '../artist'

import { NotFoundError } from './not-found.error'

export class ArtistNotFoundError extends NotFoundError {
    public readonly id: ArtistID

    public constructor(id: ArtistID) {
        super('Artist not found')

        this.id = id
    }
}
