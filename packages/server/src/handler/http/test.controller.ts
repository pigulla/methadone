import { connect } from 'node:net'

import {
    Controller,
    Get,
    Header,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    StreamableFile,
} from '@nestjs/common'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
import { type JsonObject } from 'type-fest'
import { v4 } from 'uuid'

import { ChannelID, IChannelRepository } from '../../domain/audio-addict'
import { IVlcRemote } from '../../domain/vlc'
import { TitleTransformStream } from '../../infrastructure/shoutcast-stream/title-transform-stream'

@Controller('/play')
export class TestController {
    private readonly vlc: IVlcRemote
    private readonly channelRepository: IChannelRepository
    private readonly map: Map<string, ChannelID>
    private readonly logger: PinoLogger

    public constructor(
        channelRepository: IChannelRepository,
        vlc: IVlcRemote,
        @InjectPinoLogger(TestController.name) logger: PinoLogger,
    ) {
        this.vlc = vlc
        this.channelRepository = channelRepository
        this.map = new Map()
        this.logger = logger
    }

    @Post(':channelId')
    public start(
        @Param('channelId', ParseIntPipe) channelId: ChannelID,
    ): JsonObject {
        const channel = this.channelRepository.getChannel(channelId)
        const streamId = v4()

        this.map.set(streamId, channel.id)

        return { streamId }
    }

    @Get('stream/:id')
    @Header('Content-Type', 'audio/aac')
    public get(@Param('streamId') streamId: string): StreamableFile {
        const channelId = this.map.get(streamId)

        if (channelId === undefined) {
            throw new NotFoundException('stream id not found')
        }

        const channel = this.channelRepository.getChannel(channelId)

        const socket = connect(80, 'prem2.di.fm', () => {
            socket.write(
                [
                    `GET /${channel.key}?1be8499864e8e41d HTTP/1.0`,
                    'Icy-MetaData:1',
                    '',
                    '',
                ].join('\n'),
            )
        })

        return new StreamableFile(socket)
    }

    @Get('direct/:channelId')
    @Header('Content-Type', 'audio/aac')
    public direct(
        @Param('channelId', ParseIntPipe) channelId: ChannelID,
    ): StreamableFile {
        const channel = this.channelRepository.getChannel(channelId)
        const titleStream = new TitleTransformStream(this.logger)

        const socket = connect(80, 'prem2.di.fm', () => {
            socket.write(
                [
                    `GET /${channel.key}?1be8499864e8e41d HTTP/1.0`,
                    'Icy-MetaData:1',
                    '',
                    '',
                ].join('\n'),
            )
        })

        socket.pipe(titleStream)

        return new StreamableFile(socket)
    }
}
