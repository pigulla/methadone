import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'
import {
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
} from '@nestjs/swagger'

import {
    ChannelID,
    IChannelRepository,
    NetworkID,
} from '../../../domain/audio-addict'

import { ChannelDTO } from './channel.dto'

@Controller()
export class ChannelController {
    private readonly channelRepository: IChannelRepository

    public constructor(channelRepository: IChannelRepository) {
        this.channelRepository = channelRepository
    }

    @ApiOkResponse({
        description: 'All channels',
        type: [ChannelDTO],
    })
    @ApiInternalServerErrorResponse()
    @Get('/channels')
    public getChannels(): ChannelDTO[] {
        return this.channelRepository
            .getChannels()
            .map(channel => ChannelDTO.fromDomain(channel))
    }

    @ApiOkResponse({
        description: 'A channel',
        type: [ChannelDTO],
    })
    @ApiBadRequestResponse()
    @ApiInternalServerErrorResponse()
    @Get('/channels/:channelId')
    public getChannel(
        @Param('channelId', ParseIntPipe) channelId: ChannelID,
    ): ChannelDTO {
        const channel = this.channelRepository.getChannel(channelId)

        return ChannelDTO.fromDomain(channel)
    }

    @Get('/networks/:networkId/channels')
    public getChannelsForNetwork(
        @Param('networkId', ParseIntPipe) networkId: NetworkID,
    ): ChannelDTO[] {
        return this.channelRepository
            .getChannels(networkId)
            .map(channel => ChannelDTO.fromDomain(channel))
    }
}
