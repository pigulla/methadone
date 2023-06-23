import 'reflect-metadata'
import { type Server } from 'http'
import { type AddressInfo } from 'net'

import { type INestApplication, Module, ValidationPipe } from '@nestjs/common'
import { APP_FILTER, NestFactory } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { LoggerModule } from 'nestjs-pino'
import { Logger } from 'nestjs-pino'
import { v4 } from 'uuid'

dayjs.extend(duration)

import {
    IAudioAddictApi,
    StreamUrlService,
    IStreamUrlService,
    ICurrentTimeProvider,
} from './application'
import { VlcServerConfig } from './application/config'
import { DataLoader } from './application/data-loader'
import {
    IArtistRepository,
    IChannelFilterRepository,
    IChannelRepository,
    INetworkRepository,
    ITrackRepository,
    type ListenKey,
} from './domain/audio-addict'
import { IVlcRemote } from './domain/vlc'
import {
    ChannelController,
    ChannelFilterController,
    NetworkController,
    NotFoundExceptionFilter,
    TestController,
} from './handler/http'
import { CurrentTimeProvider } from './infrastructure'
import {
    CachingAudioAddictApi,
    ETagAwareAudioAddictApi,
    IETagAwareAudioAddictApi,
} from './infrastructure/audio-addict'
import {
    ChannelFilterRepository,
    ChannelRepository,
    DatabaseConnection,
    NetworkRepository,
    ArtistRepository,
    IDatabaseConnection,
    TrackRepository,
} from './infrastructure/persistence'
import { VlcHttpRemote } from './infrastructure/vlc'
import { ConfigModule } from './module'

const level = process.env.LOG_LEVEL || 'info'

@Module({
    imports: [
        LoggerModule.forRoot({
            pinoHttp: {
                level,
                autoLogging: false,
                genReqId: _request => v4(),
                transport: {
                    target: 'pino-pretty',
                },
            },
        }),
        ScheduleModule.forRoot(),
        EventEmitterModule.forRoot(),
        ConfigModule,
    ],
    controllers: [
        ChannelController,
        ChannelFilterController,
        NetworkController,
        TestController,
    ],
    providers: [
        DataLoader,
        {
            provide: APP_FILTER,
            useClass: NotFoundExceptionFilter,
        },
        {
            provide: IDatabaseConnection,
            useClass: DatabaseConnection,
        },
        {
            provide: ICurrentTimeProvider,
            useClass: CurrentTimeProvider,
        },
        {
            provide: IAudioAddictApi,
            useClass: CachingAudioAddictApi,
        },
        {
            provide: IETagAwareAudioAddictApi,
            useClass: ETagAwareAudioAddictApi,
        },
        {
            provide: IArtistRepository,
            useClass: ArtistRepository,
        },
        {
            provide: ITrackRepository,
            useClass: TrackRepository,
        },
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
            provide: IStreamUrlService,
            inject: [IAudioAddictApi, INetworkRepository, IChannelRepository],
            useFactory(
                audioAddictApi: IAudioAddictApi,
                networkRepository: INetworkRepository,
                channelRepository: IChannelRepository,
            ): IStreamUrlService {
                return new StreamUrlService(
                    process.env.LISTEN_KEY as ListenKey,
                    audioAddictApi,
                    networkRepository,
                    channelRepository,
                )
            },
        },
        {
            provide: IVlcRemote,
            useClass: VlcHttpRemote,
        },
    ],
})
class AppModule {}

let app: INestApplication
let logger: Logger

async function bootstrap() {
    app = await NestFactory.create(AppModule, { bufferLogs: true })
    logger = app.get(Logger)

    const config = new DocumentBuilder()
        .setTitle('AudioAddict API')
        .setDescription('The AudioAddict API')
        .setVersion('1.0')
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api', app, document)

    app.useLogger(logger)
    app.enableShutdownHooks()
    app.useGlobalPipes(
        new ValidationPipe({
            forbidNonWhitelisted: true,
            forbidUnknownValues: true,
        }),
    )

    const server = (await app.listen(3003)) as Server
    const { port } = server.address() as AddressInfo
    logger.log(`Server listening on port ${port}`)
}

async function shutdown(): Promise<void> {
    logger.log('Shutting down server')

    await app?.close()
}

process.on('SIGINT', () => void shutdown())

bootstrap().catch(error => {
    logger.error(error)
    void shutdown()
    process.exitCode = 1
})
