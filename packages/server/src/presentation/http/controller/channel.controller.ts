import { ChannelDTO, createChannelDTO } from '@digitally-exported/dto'
import {
  type ChannelKey,
  channelKeySchema,
  type NetworkKey,
  networkKeySchema,
} from '@digitally-exported/types'

import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { ZodResponse, ZodValidationPipe } from 'nestjs-zod'

import { IChannelService } from '#application/channel.service.interface.js'
import { ApiKeyGuard } from '#presentation/http/api-key.guard.js'

@Controller()
@UseGuards(ApiKeyGuard)
@ApiTags('channels')
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
export class ChannelController {
  private readonly channelService: IChannelService

  public constructor(channelService: IChannelService) {
    this.channelService = channelService
  }

  @Get('networks/:networkKey/channels')
  @ApiParam({ name: 'networkKey', type: 'string', example: 'di' })
  @ApiOperation({
    summary: 'Get all channels of a network.',
    description: 'Get all channels of the network with the given key.',
  })
  @ZodResponse({
    description: 'The operation completed successfully.',
    status: HttpStatus.OK,
    type: [ChannelDTO],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The network with the given key was not found.',
  })
  public async getChannelsForNetwork(
    @Param('networkKey', new ZodValidationPipe(networkKeySchema)) networkKey: NetworkKey,
  ) {
    const channels = await this.channelService.getAllForNetwork(networkKey)
    return channels.map(channel => createChannelDTO(channel))
  }

  @Get('networks/:networkKey/channels/:channelKey')
  @ApiParam({ name: 'networkKey', type: 'string', example: 'di' })
  @ApiParam({ name: 'channelKey', type: 'string', example: 'trance' })
  @ApiOperation({
    summary: 'Get the channel with the given key.',
    description: 'Get the channels with the given key for the given network.',
  })
  @ZodResponse({
    description: 'The operation completed successfully.',
    status: HttpStatus.OK,
    type: ChannelDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The network or channel with the given key was not found.',
  })
  public async getChannelForNetwork(
    @Param('networkKey', new ZodValidationPipe(networkKeySchema)) networkKey: NetworkKey,
    @Param('channelKey', new ZodValidationPipe(channelKeySchema))
    channelKey: ChannelKey,
  ) {
    const channel = await this.channelService.get(networkKey, channelKey)
    return createChannelDTO(channel)
  }
}
