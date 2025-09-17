import { ChannelFilterDTO, createChannelFilterDTO } from '@digitally-exported/dto'
import {
  type ChannelFilterKey,
  channelFilterKeySchema,
  type NetworkKey,
  networkKeySchema,
} from '@digitally-exported/types'

import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { ZodResponse, ZodValidationPipe } from 'nestjs-zod'

import { IChannelFilterService } from '#application/channel-filter.service.interface.js'
import { ApiKeyGuard } from '#presentation/http/api-key.guard.js'

@Controller()
@UseGuards(ApiKeyGuard)
@ApiTags('channel-filters')
@ApiSecurity('api-key')
@ApiResponse({
  status: HttpStatus.BAD_REQUEST,
  description:
    'A query or route parameter, the payload or a header was malformed and did not pass validation.',
})
@ApiResponse({
  status: HttpStatus.FORBIDDEN,
  description: 'No suitable API key was provided by the client.',
})
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'An unexpected error occurred.',
})
export class ChannelFilterController {
  private readonly channelFilterService: IChannelFilterService

  public constructor(channelFilterService: IChannelFilterService) {
    this.channelFilterService = channelFilterService
  }

  @Get('networks/:networkKey/channel-filters')
  @ApiParam({ name: 'networkKey', type: 'string', example: 'di' })
  @ApiOperation({
    summary: 'Get all channel filters of a network.',
    description: 'Get all channel filters of the network with the given key.',
  })
  @ZodResponse({
    description: 'The operation completed successfully.',
    status: HttpStatus.OK,
    type: [ChannelFilterDTO],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The network with the given key was not found.',
  })
  public async getChannelFiltersForNetwork(
    @Param('networkKey', new ZodValidationPipe(networkKeySchema)) networkKey: NetworkKey,
  ) {
    const channelFilters = await this.channelFilterService.getAllForNetwork(networkKey)
    return channelFilters.map(channelFilter =>
      createChannelFilterDTO({ ...channelFilter, channels: [...channelFilter.channels] }),
    )
  }

  @Get('networks/:networkKey/channel-filters/:channelFilterKey')
  @ApiParam({ name: 'networkKey', type: 'string', example: 'di' })
  @ApiParam({ name: 'channelFilterKey', type: 'string', example: 'popular' })
  @ApiOperation({
    summary: 'Get the channel filters with the given key.',
    description: 'Get the channel filters with the given key for the given network.',
  })
  @ZodResponse({
    description: 'The operation completed successfully.',
    status: HttpStatus.OK,
    type: ChannelFilterDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The network or channel filter with the given key was not found.',
  })
  public async getChannelFilterForNetwork(
    @Param('networkKey', new ZodValidationPipe(networkKeySchema)) networkKey: NetworkKey,
    @Param('channelFilterKey', new ZodValidationPipe(channelFilterKeySchema))
    channelFilterKey: ChannelFilterKey,
  ) {
    const channelFilter = await this.channelFilterService.get(networkKey, channelFilterKey)
    return createChannelFilterDTO({ ...channelFilter, channels: [...channelFilter.channels] })
  }
}
