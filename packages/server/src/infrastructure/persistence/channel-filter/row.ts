import dayjs from 'dayjs'

import {
    ChannelFilter,
    type ChannelFilterID,
    type ChannelFilterKey,
    type ChannelID,
    type NetworkID,
} from '../../../domain/audio-addict'

export type Row = {
    id: ChannelFilterID
    network_id: NetworkID
    key: ChannelFilterKey
    name: string
    title: string | null
    text: string | null
    created_at: string | null
    updated_at: string | null
}

export type RowWithChannels = Row & { channel_ids: string }

export function rowToDomain(row: RowWithChannels): ChannelFilter {
    return new ChannelFilter({
        ...row,
        networkId: row.network_id,
        createdAt: row.created_at ? dayjs(row.created_at) : null,
        updatedAt: row.updated_at ? dayjs(row.updated_at) : null,
        channels: new Set(JSON.parse(row.channel_ids) as ChannelID[]),
    })
}
