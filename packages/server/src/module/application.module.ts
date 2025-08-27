import { Module, Scope } from '@nestjs/common'
import findCacheDirectory from 'find-cache-directory'

import { IChannelService } from '#application/channel.service.interface.js'
import { ChannelService } from '#application/channel.service.js'
import { IChannelFilterService } from '#application/channel-filter.service.interface.js'
import { ChannelFilterService } from '#application/channel-filter.service.js'
import { INetworkService } from '#application/network.service.interface.js'
import { NetworkService } from '#application/network.service.js'
import { IStreamProvider } from '#application/stream-provider.interface.js'
import { IAudioAddictAPI } from '#infrastructure/audio-addict/api/audio-addict-api.interface.js'
import { AudioAddictAPI } from '#infrastructure/audio-addict/api/audio-addict-api.js'
import { IETagCache } from '#infrastructure/audio-addict/api/etag-cache.interface.js'
import { CACHE_DIRECTORY, ETagCache } from '#infrastructure/audio-addict/api/etag-cache.js'
import { DataImporter } from '#infrastructure/audio-addict/data-importer.js'
import { IIcecastTransformStream } from '#infrastructure/stream/icecast-transform-stream.interface.js'
import { IcecastTransformStream } from '#infrastructure/stream/icecast-transform-stream.js'
import { StreamProvider } from '#infrastructure/stream/stream-provider.js'

import { ICurrentlyPlayingUpdater } from '../infrastructure/audio-addict/currently-playing/currently-playing-updater.interface.js'
import { CurrentlyPlayingUpdater } from '../infrastructure/audio-addict/currently-playing/currently-playing-updater.js'

import { ConfigModule } from './config.module.js'
import { RepositoryModule } from './repository.module.js'

@Module({
  imports: [RepositoryModule, ConfigModule],
  providers: [
    { provide: IAudioAddictAPI, useClass: AudioAddictAPI },
    { provide: IETagCache, useClass: ETagCache },
    {
      provide: CACHE_DIRECTORY,
      useValue: findCacheDirectory({ name: '@methadone/server', create: true }),
    },
    DataImporter,
    { provide: ICurrentlyPlayingUpdater, useClass: CurrentlyPlayingUpdater },
    {
      provide: INetworkService,
      useClass: NetworkService,
    },
    {
      provide: IChannelService,
      useClass: ChannelService,
    },
    {
      provide: IChannelFilterService,
      useClass: ChannelFilterService,
    },
    {
      provide: IStreamProvider,
      useClass: StreamProvider,
    },
    { provide: IIcecastTransformStream, useClass: IcecastTransformStream, scope: Scope.TRANSIENT },
  ],
  exports: [INetworkService, IChannelService, IChannelFilterService, IStreamProvider],
})
export class ApplicationModule {}
