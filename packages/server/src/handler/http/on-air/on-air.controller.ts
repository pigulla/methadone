import {
    Controller,
    Get,
    HttpStatus,
    Param,
    ParseIntPipe,
    Res,
} from '@nestjs/common'
import { ApiInternalServerErrorResponse, ApiOkResponse } from '@nestjs/swagger'
import { type Response } from 'express'

import { IAudioAddictApi } from '../../../application'
import {
    type ChannelID,
    IChannelRepository,
    IOnAirRepository,
} from '../../../domain/audio-addict'

import { OnAirTrackDTO } from './on-air-track.dto'

@Controller()
export class OnAirController {
    private readonly audioAddictApi: IAudioAddictApi
    private readonly channelRepository: IChannelRepository
    private readonly onAirRepository: IOnAirRepository

    public constructor(
        audioAddictApi: IAudioAddictApi,
        channelRepository: IChannelRepository,
        onAirRepository: IOnAirRepository,
    ) {
        this.audioAddictApi = audioAddictApi
        this.channelRepository = channelRepository
        this.onAirRepository = onAirRepository
    }

    @ApiOkResponse({
        // TODO
    })
    @ApiInternalServerErrorResponse()
    @Get('/channels/:channelId/on-air')
    public async getOnAir(
        @Param('channelId', ParseIntPipe) channelId: ChannelID,
        @Res() response: Response,
    ): Promise<void> {
        const channel = this.channelRepository.getChannel(channelId)
        const onAir = this.onAirRepository.getOnAir(channel.id)

        if (onAir === null) {
            response.status(HttpStatus.NO_CONTENT).send()
        } else {
            response.status(HttpStatus.OK).send(
                new OnAirTrackDTO({
                    title: onAir.title,
                    artist: onAir.artist.name,
                    startedAt: onAir.startedAt.toISOString(),
                    duration: onAir.duration.toISOString(),
                }),
            )
        }
    }
}
