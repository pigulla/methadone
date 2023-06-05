import { type TrackID } from '../track'

import { NotFoundError } from './not-found.error'

export class TrackNotFoundError extends NotFoundError {
    public readonly id: TrackID

    public constructor(id: TrackID) {
        super('Track not found')

        this.id = id
    }
}
