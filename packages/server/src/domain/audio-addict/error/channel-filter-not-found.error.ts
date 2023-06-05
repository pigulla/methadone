import { type ChannelFilterID, type ChannelFilterKey } from '../channel-filter'

import { NotFoundError } from './not-found.error'

export class ChannelFilterNotFoundError extends NotFoundError {
    public readonly idOrKey: ChannelFilterID | ChannelFilterKey

    public constructor(idOrKey: ChannelFilterID | ChannelFilterKey) {
        super('Channel filter not found')

        this.idOrKey = idOrKey
    }
}
