import { Module, Scope } from '@nestjs/common'
import findCacheDirectory from 'find-cache-directory'

import { IChannelService } from '#application/channel.service.interface.js'
import { ChannelService } from '#application/channel.service.js'
import { IChannelFilterService } from '#application/channel-filter.service.interface.js'
import { ChannelFilterService } from '#application/channel-filter.service.js'
import { INetworkService } from '#application/network.service.interface.js'
import { NetworkService } from '#application/network.service.js'
import { IStreamManager } from '#application/stream-provider.interface.js'
import { IAudioAddictAPI } from '#infrastructure/audio-addict/api/audio-addict-api.interface.js'
import { AudioAddictAPI } from '#infrastructure/audio-addict/api/audio-addict-api.js'
import { ICurrentlyPlayingUpdater } from '#infrastructure/audio-addict/currently-playing/currently-playing-updater.interface.js'
import { CurrentlyPlayingUpdater } from '#infrastructure/audio-addict/currently-playing/currently-playing-updater.js'
import { DataImporter } from '#infrastructure/audio-addict/data-importer.js'
import { ICache } from '#infrastructure/cache/cache.interface.js'
import { CACHE_DIRECTORY, FileSystemCache } from '#infrastructure/cache/file-system-cache.js'
import { IIcecastTransformStream } from '#infrastructure/stream/icecast-transform-stream.interface.js'
import { IcecastTransformStream } from '#infrastructure/stream/icecast-transform-stream.js'
import { StreamManager } from '#infrastructure/stream/stream-manager.js'

import { ConfigModule } from './config.module.js'
import { RepositoryModule } from './repository.module.js'

@Module({
  imports: [RepositoryModule, ConfigModule],
  providers: [
    { provide: IAudioAddictAPI, useClass: AudioAddictAPI },
    { provide: ICache, useClass: FileSystemCache },
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
      provide: IStreamManager,
      useClass: StreamManager,
    },

    { provide: IIcecastTransformStream, useClass: IcecastTransformStream, scope: Scope.TRANSIENT },
  ],
  exports: [INetworkService, IChannelService, IChannelFilterService, IStreamManager],
})
export class ApplicationModule {}
