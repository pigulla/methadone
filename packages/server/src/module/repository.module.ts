import { Module } from '@nestjs/common'

import { IChannelRepository } from '#domain/channel/channel.repository.interface.js'
import { IChannelFilterRepository } from '#domain/channel-filter/channel-filter.repository.interface.js'
import { ICurrentlyPlayingRepository } from '#domain/currently-playing/currently-playing.repository.interface.js'
import { INetworkRepository } from '#domain/network/network.repository.interface.js'
import { ChannelRepository } from '#infrastructure/persistence/channel/channel.repository.js'
import { ChannelFilterRepository } from '#infrastructure/persistence/channel-filter/channel-filter.repository.js'
import { CurrentlyPlayingRepository } from '#infrastructure/persistence/currently-playing/currently-playing.repository.js'
import { NetworkRepository } from '#infrastructure/persistence/network/network.repository.js'

import { DatabaseModule } from './database.module.js'

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: INetworkRepository,
      useClass: NetworkRepository,
    },
    {
      provide: IChannelRepository,
      useClass: ChannelRepository,
    },
    {
      provide: IChannelFilterRepository,
      useClass: ChannelFilterRepository,
    },
    {
      provide: ICurrentlyPlayingRepository,
      useClass: CurrentlyPlayingRepository,
    },
  ],
  exports: [
    INetworkRepository,
    IChannelRepository,
    IChannelFilterRepository,
    ICurrentlyPlayingRepository,
  ],
})
export class RepositoryModule {}
