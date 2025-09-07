import type { Insertable, Selectable } from 'kysely'

export interface NetworksTable {
  id: number
  key: string
  name: string
  url: string
  listen_url: string
}

export type NetworkEntity = Selectable<NetworksTable>
export type NewNetworkEntity = Insertable<NetworksTable>

export interface ChannelsTable {
  id: number
  network_id: number
  key: string
  name: string
  description: string
  director: string
}

export type ChannelEntity = Selectable<ChannelsTable>
export type NewChannelEntity = Insertable<ChannelsTable>

export interface ChannelFiltersTable {
  id: number
  network_id: number
  key: string
  name: string
  position: number
}

export type ChannelFilterEntity = Selectable<ChannelsTable>
export type NewChannelFilterEntity = Insertable<ChannelsTable>

export interface ChannelsToChannelFiltersTable {
  channel_id: number
  channel_filter_id: number
}

export interface SimilarChannelsTable {
  channel_id: number
  similar_channel_id: number
}

export interface ChannelsView {
  id: number
  network_id: number
  key: string
  name: string
  description: string
  director: string
  similar_channels: number[]
}

export interface ChannelFiltersView {
  id: number
  network_id: number
  key: string
  name: string
  position: number
  channel_ids: number[]
}

export interface CurrentlyPlayingTable {
  channel_id: number
  artist: string | null
  title: string | null
  started_at: string | null
  duration: number | null
}

export interface DatabaseType {
  networks: NetworksTable
  channels: ChannelsTable
  similar_channels: SimilarChannelsTable
  channel_filters: ChannelFiltersTable
  channels_to_channel_filters: ChannelsToChannelFiltersTable
  view_channels: ChannelsView
  view_channel_filters: ChannelFiltersView
  currently_playing: CurrentlyPlayingTable
}
