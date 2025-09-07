import {
  CurrentlyPlayingDTO,
  CurrentlyPlayingOnNetworkDTO,
  createCurrentlyPlayingDTO,
  createCurrentlyPlayingOnNetworkDTO,
} from '@methadone/dto'
import {
  type ChannelKey,
  channelKeySchema,
  type NetworkKey,
  networkKeySchema,
} from '@methadone/types'

import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { ZodResponse, ZodValidationPipe } from 'nestjs-zod'

import { IChannelService } from '#application/channel.service.interface.js'
import { ApiKeyGuard } from '#presentation/http/api-key.guard.js'

@Controller()
@UseGuards(ApiKeyGuard)
@ApiTags('currently-playing')
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
export class CurrentlyPlayingController {
  private readonly channelService: IChannelService

  public constructor(channelService: IChannelService) {
    this.channelService = channelService
  }

  @Get('networks/:networkKey/channels/:channelKey/currently-playing')
  @ApiParam({ name: 'networkKey', type: 'string', example: 'di' })
  @ApiParam({ name: 'channelKey', type: 'string', example: 'trance' })
  @ApiOperation({
    summary: 'Get the track currently playing on the channel with the given key.',
    description:
      'Get the track currently playing on the channel with the given key for the given network.',
  })
  @ZodResponse({
    description: 'The operation completed successfully.',
    status: HttpStatus.OK,
    type: CurrentlyPlayingDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The network or channel with the given key was not found.',
  })
  public async getCurrentlyPlayingOnChannel(
    @Param('networkKey', new ZodValidationPipe(networkKeySchema)) networkKey: NetworkKey,
    @Param('channelKey', new ZodValidationPipe(channelKeySchema))
    channelKey: ChannelKey,
  ) {
    const currentlyPlaying = await this.channelService.getCurrentlyPlayingOnChannel(
      networkKey,
      channelKey,
    )
    return createCurrentlyPlayingDTO(
      currentlyPlaying
        ? {
            ...currentlyPlaying,
            startedAt: currentlyPlaying.startedAt.toISOString(),
            endsAt: currentlyPlaying.startedAt.add(currentlyPlaying.duration).toISOString(),
          }
        : null,
    )
  }

  @Get('networks/:networkKey/currently-playing')
  @ApiParam({ name: 'networkKey', type: 'string', example: 'di' })
  @ApiOperation({
    summary: 'Get the track currently playing on the network with the given key.',
    description: 'Get the track currently playing on the network with the given key.',
  })
  @ZodResponse({
    description: 'The operation completed successfully.',
    status: HttpStatus.OK,
    type: CurrentlyPlayingOnNetworkDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The network was not found.',
  })
  public async getCurrentlyPlayingOnNetwork(
    @Param('networkKey', new ZodValidationPipe(networkKeySchema)) networkKey: NetworkKey,
  ) {
    const currentlyPlaying = await this.channelService.getCurrentlyPlayingOnNetwork(networkKey)

    return createCurrentlyPlayingOnNetworkDTO(
      [...currentlyPlaying.entries()].map(([channelId, entry]) => [
        channelId,
        entry
          ? {
              ...entry,
              startedAt: entry.startedAt.toISOString(),
              endsAt: entry.startedAt.add(entry.duration).toISOString(),
            }
          : null,
      ]),
    )
  }
}
