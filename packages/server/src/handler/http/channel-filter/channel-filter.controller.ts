import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'
import {
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
} from '@nestjs/swagger'

import {
    ChannelFilterID,
    IChannelFilterRepository,
    NetworkID,
} from '../../../domain/audio-addict'

import { ChannelFilterDTO } from './channel-filter.dto'

@Controller()
export class ChannelFilterController {
    private readonly channelFilterRepository: IChannelFilterRepository

    public constructor(channelFilterRepository: IChannelFilterRepository) {
        this.channelFilterRepository = channelFilterRepository
    }

    @ApiOkResponse({
        description: 'All channel filters',
        type: [ChannelFilterDTO],
    })
    @ApiInternalServerErrorResponse()
    @Get('/channel-filters')
    public getChannels(): ChannelFilterDTO[] {
        return this.channelFilterRepository
            .getChannelFilters()
            .map(channelFilter => ChannelFilterDTO.fromDomain(channelFilter))
    }

    @ApiOkResponse({
        description: 'A channel filter',
        type: [ChannelFilterDTO],
    })
    @ApiBadRequestResponse()
    @ApiInternalServerErrorResponse()
    @Get('/channel-filters/:channelFilterId')
    public getChannel(
        @Param('channelFilterId', ParseIntPipe)
            channelFilterId: ChannelFilterID,
    ): ChannelFilterDTO {
        const channelFilter =
            this.channelFilterRepository.getChannelFilter(channelFilterId)

        return ChannelFilterDTO.fromDomain(channelFilter)
    }

    @Get('/networks/:networkId/channel-filters')
    public getChannelsForNetwork(
        @Param('networkId', ParseIntPipe) networkId: NetworkID,
    ): ChannelFilterDTO[] {
        return this.channelFilterRepository
            .getChannelFiltersForNetwork(networkId)
            .map(channelFilter => ChannelFilterDTO.fromDomain(channelFilter))
    }
}
