import { HttpStatus, type INestApplication } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { Test } from '@nestjs/testing'
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { IChannelService } from '#application/channel.service.interface.js'
import { ChannelServiceMock, mockChannelService } from '#application/channel.service.mock.js'
import { IChannelFilterService } from '#application/channel-filter.service.interface.js'
import {
  ChannelFilterServiceMock,
  mockChannelFilterService,
} from '#application/channel-filter.service.mock.js'
import { INetworkService } from '#application/network.service.interface.js'
import { mockNetworkService, NetworkServiceMock } from '#application/network.service.mock.js'
import { Network } from '#domain/network/network'
import { NetworkNotFoundError } from '#domain/network/network-not-found.error'
import { ApiKeyGuard } from '#presentation/http/api-key.guard'
import { EntityNotFoundExceptionFilter } from '#presentation/http/entity-not-found.exception-filter'
import { NetworkController } from '#presentation/http/network.controller.js'

describe('NetworkController', () => {
  let networkServiceMock: NetworkServiceMock
  let channelServiceMock: ChannelServiceMock
  let channelFilterServiceMock: ChannelFilterServiceMock
  let app: INestApplication

  beforeEach(async () => {
    networkServiceMock = mockNetworkService()
    channelServiceMock = mockChannelService()
    channelFilterServiceMock = mockChannelFilterService()

    const module = await Test.createTestingModule({
      controllers: [NetworkController],
      providers: [
        { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
        { provide: APP_PIPE, useClass: ZodValidationPipe },
        {
          provide: INetworkService,
          useValue: networkServiceMock,
        },
        {
          provide: IChannelService,
          useValue: channelServiceMock,
        },
        {
          provide: IChannelFilterService,
          useValue: channelFilterServiceMock,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile()

    app = module.createNestApplication({ logger: false })

    await app.useGlobalFilters(new EntityNotFoundExceptionFilter(app.getHttpAdapter())).init()
  })

  afterEach(() => app.close())

  describe('GET /networks/<network-key>', () => {
    const network = Network.create({
      id: 42,
      key: 'banana',
      name: 'Banana',
      url: 'http://banana.test',
      listenUrl: 'http://listen.banana.test',
    })

    afterEach(() => {
      expect(networkServiceMock.get).toHaveBeenCalledExactlyOnceWith(network.key)
    })

    it('should return a 200', async () => {
      networkServiceMock.get.mockResolvedValue(network)

      await request(app.getHttpServer()).get('/networks/banana').expect(HttpStatus.OK).expect({
        id: network.id,
        key: network.key,
        name: network.name,
        url: network.url,
      })
    })

    it('should return a 404', async () => {
      networkServiceMock.get.mockRejectedValue(new NetworkNotFoundError(network.key))

      await request(app.getHttpServer()).get('/networks/banana').expect(HttpStatus.NOT_FOUND)
    })

    it('should return a 500', async () => {
      networkServiceMock.get.mockImplementation(() => {
        throw new Error('Boom!')
      })

      await request(app.getHttpServer())
        .get('/networks/banana')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
    })
  })
})
