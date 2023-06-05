import { type OnApplicationBootstrap } from '@nestjs/common'
import { type Database } from 'better-sqlite3'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import pLimit from 'p-limit'

import {
    type Channel,
    type ChannelFilter,
    IChannelFilterRepository,
    IChannelRepository,
    INetworkRepository,
    type Network,
} from '../domain/audio-addict'
import { IDatabaseConnection } from '../infrastructure/persistence'

import { IAudioAddictApi } from './audio-addict-api.interface'

export class DataLoader implements OnApplicationBootstrap {
    private readonly limit = pLimit(5)
    private readonly db: Database
    private readonly api: IAudioAddictApi
    private readonly networkRepository: INetworkRepository
    private readonly channelRepository: IChannelRepository
    private readonly channelFilterRepository: IChannelFilterRepository
    private readonly logger: PinoLogger

    public constructor(
        databaseConnection: IDatabaseConnection,
        audioAddictApi: IAudioAddictApi,
        networkRepository: INetworkRepository,
        channelRepository: IChannelRepository,
        channelFilterRepository: IChannelFilterRepository,
        @InjectPinoLogger(DataLoader.name)
        logger: PinoLogger,
    ) {
        this.db = databaseConnection.db
        this.api = audioAddictApi
        this.networkRepository = networkRepository
        this.channelRepository = channelRepository
        this.channelFilterRepository = channelFilterRepository
        this.logger = logger
    }

    private async loadNetworks(): Promise<Network[]> {
        this.logger.trace('Loading networks')

        const networks = await this.api.getNetworks()
        this.logger.info(`Successfully loaded ${networks.length} network(s)`)

        return networks
    }

    private async loadChannels(networks: Network[]): Promise<Channel[]> {
        const promises = networks.map(network =>
            this.limit(async () => {
                this.logger.trace(
                    `Loading channels for network '${network.key}'`,
                )
                const channels = await this.api.getChannels(network.key)
                this.logger.info(
                    `Successfully loaded ${channels.length} channel(s) for network '${network.key}'`,
                )
                return channels
            }),
        )

        return (await Promise.all(promises)).flat()
    }

    private async loadChannelFilters(
        networks: Network[],
    ): Promise<ChannelFilter[]> {
        const promises = networks.map(network =>
            this.limit(async () => {
                this.logger.trace(
                    `Loading channel filters for network '${network.key}'`,
                )
                const channelFilters = await this.api.getChannelFilters(
                    network.key,
                )
                this.logger.info(
                    `Successfully loaded ${channelFilters.length} channel filter(s) for network '${network.key}'`,
                )
                return channelFilters
            }),
        )

        return (await Promise.all(promises)).flat()
    }

    public async onApplicationBootstrap(): Promise<void> {
        const networks = await this.loadNetworks()
        const channels = await this.loadChannels(networks)
        const channelFilters = await this.loadChannelFilters(networks)

        this.db
            .transaction(() => {
                this.logger.trace(
                    `Inserting ${networks.length} network(s) into the database`,
                )
                for (const network of networks) {
                    this.networkRepository.insertNetwork(network)
                }
                this.logger.info(
                    `Inserted ${networks.length} network(s) into the database`,
                )

                this.logger.trace(
                    `Inserting ${networks.length} channel(s) into the database`,
                )
                for (const channel of channels) {
                    this.channelRepository.insertChannel(channel)
                }
                this.logger.info(
                    `Inserted ${channels.length} channels(s) into the database`,
                )

                this.logger.trace(
                    `Inserting ${channelFilters.length} channel filter(s) into the database`,
                )
                for (const channelFilter of channelFilters) {
                    this.channelFilterRepository.insertChannelFilter(
                        channelFilter,
                    )
                }
                this.logger.info(
                    `Inserted ${channelFilters.length} channel filters(s) into the database`,
                )
            })
            .deferred()
    }
}
