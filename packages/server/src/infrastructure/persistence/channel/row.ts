import {
    Channel,
    type ChannelID,
    type ChannelKey,
    type NetworkID,
} from '../../../domain/audio-addict'

export type Row = {
    id: ChannelID
    network_id: NetworkID
    key: ChannelKey
    name: string
}

export type RowWithSimilar = Row & { similar_channel_ids: string }

export function rowToDomain(row: RowWithSimilar): Channel {
    return new Channel({
        ...row,
        networkId: row.network_id,
        similarChannels: new Set(
            JSON.parse(row.similar_channel_ids) as ChannelID[],
        ),
    })
}
