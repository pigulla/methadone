import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'
import {
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
} from '@nestjs/swagger'

import { INetworkRepository, NetworkID } from '../../../domain/audio-addict'

import { NetworkDTO } from './network.dto'

@Controller('/networks')
export class NetworkController {
    private readonly repository: INetworkRepository

    public constructor(networkRepository: INetworkRepository) {
        this.repository = networkRepository
    }

    @ApiOkResponse({
        description: 'All networks',
        type: [NetworkDTO],
    })
    @ApiInternalServerErrorResponse()
    @Get()
    public getChannels(): NetworkDTO[] {
        return this.repository
            .getNetworks()
            .map(network => NetworkDTO.fromDomain(network))
    }

    @ApiOkResponse({
        description: 'A network',
        type: [NetworkDTO],
    })
    @ApiBadRequestResponse()
    @ApiInternalServerErrorResponse()
    @Get('/:networkId')
    public getChannel(
        @Param('networkId', ParseIntPipe) networkId: NetworkID,
    ): NetworkDTO {
        const network = this.repository.getNetwork(networkId)

        return NetworkDTO.fromDomain(network)
    }
}
