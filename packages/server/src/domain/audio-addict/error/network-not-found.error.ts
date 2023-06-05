import { type NetworkKey, type NetworkID } from '../network'

import { NotFoundError } from './not-found.error'

export class NetworkNotFoundError extends NotFoundError {
    public readonly idOrKey: NetworkID | NetworkKey

    public constructor(idOrKey: NetworkID | NetworkKey) {
        super('Network not found')

        this.idOrKey = idOrKey
    }
}
