import { createNetworkDTO, NetworkDTO } from '@methadone/dto'
import { type NetworkKey, networkKeySchema } from '@methadone/types'

import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { ZodResponse, ZodValidationPipe } from 'nestjs-zod'

import { INetworkService } from '#application/network.service.interface.js'
import { ApiKeyGuard } from '#presentation/http/api-key.guard.js'

@Controller('networks')
@UseGuards(ApiKeyGuard)
@ApiTags('networks')
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
export class NetworkController {
  private readonly networkService: INetworkService

  public constructor(networkService: INetworkService) {
    this.networkService = networkService
  }

  @Get()
  @ApiOperation({
    summary: 'Get all networks.',
    description: 'Get all networks.',
  })
  @ZodResponse({
    description: 'The operation completed successfully.',
    status: HttpStatus.OK,
    type: [NetworkDTO],
  })
  public async getAll() {
    const networks = await this.networkService.getAll()
    return networks.map(network => createNetworkDTO(network))
  }

  @Get(':networkKey')
  @ApiParam({ name: 'networkKey', type: 'string', example: 'di' })
  @ApiOperation({
    summary: 'Get a network by key.',
    description: 'Get the network with the given key.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: NetworkDTO,
    description: 'The operation completed successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'The network with the given key was not found.',
  })
  public async getOne(
    @Param('networkKey', new ZodValidationPipe(networkKeySchema)) networkKey: NetworkKey,
  ): Promise<NetworkDTO> {
    const network = await this.networkService.get(networkKey)
    return createNetworkDTO(network)
  }
}
