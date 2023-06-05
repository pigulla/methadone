import { type ChannelID, type ChannelKey } from '../channel'

import { NotFoundError } from './not-found.error'

export class ChannelNotFoundError extends NotFoundError {
    public readonly idOrKey: ChannelID | ChannelKey

    public constructor(idOrKey: ChannelID | ChannelKey) {
        super('Channel not found')

        this.idOrKey = idOrKey
    }
}
