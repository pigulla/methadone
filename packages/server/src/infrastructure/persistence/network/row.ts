import {
    Network,
    type NetworkID,
    type NetworkKey,
} from '../../../domain/audio-addict'

export type Row = {
    id: NetworkID
    key: NetworkKey
    name: string
    url: string
}

export function rowToDomain(row: Row): Network {
    return new Network(row)
}
