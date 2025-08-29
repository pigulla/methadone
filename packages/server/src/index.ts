import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { SwaggerModule } from '@nestjs/swagger'
import dayjs from 'dayjs'
import durationPlugin from 'dayjs/plugin/duration.js'
import objectSupportPlugin from 'dayjs/plugin/objectSupport.js'
import { Logger } from 'nestjs-pino'

import { OPEN_API_CONFIG, type OpenApiConfig } from '#infrastructure/config/open-api.config.js'
import { SERVER_CONFIG, type ServerConfig } from '#infrastructure/config/server.config.js'
import { MainModule } from '#module/main.module.js'
import { EntityNotFoundExceptionFilter } from '#presentation/http/entity-not-found.exception-filter.js'
import { createOpenAPIDocument } from '#util/create-openapi-document.js'

dayjs.extend(durationPlugin)
dayjs.extend(objectSupportPlugin)

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(MainModule, {
    bufferLogs: false,
    cors: { origin: '*' },
  })

  const server = app.get<ServerConfig>(SERVER_CONFIG)
  const openApi = app.get<OpenApiConfig>(OPEN_API_CONFIG)
  const logger = app.get(Logger)
  const adapter = app.getHttpAdapter()

  app.useGlobalFilters(new EntityNotFoundExceptionFilter(adapter)).useLogger(logger)

  if (openApi.swagger.enabled) {
    SwaggerModule.setup(openApi.swagger.path, app, () => createOpenAPIDocument(app, openApi))
  }

  process.on('SIGINT', () => {
    logger.log('Server shutdown requested (SIGINT)')
    void app.close()
  })

  await app.listen(server.port, server.hostname, async () => {
    const url = await app.getUrl()
    logger.log(`Server listening on ${url}`)
  })
}

void bootstrap()
