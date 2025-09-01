import type { INestApplication } from '@nestjs/common'
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger'
import dayjs from 'dayjs'
import durationPlugin from 'dayjs/plugin/duration.js'
import { cleanupOpenApiDoc } from 'nestjs-zod'

import type { OpenApiConfig } from '#infrastructure/config/open-api.config.js'

dayjs.extend(durationPlugin)

export function createOpenAPIDocument(
  app: INestApplication,
  openApiConfig: OpenApiConfig,
): OpenAPIObject {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(openApiConfig.title)
      .setDescription(openApiConfig.description)
      .setVersion(openApiConfig.version)
      .setLicense(openApiConfig.license.name, openApiConfig.license.url)
      .setContact(
        openApiConfig.contact.name,
        openApiConfig.contact.url,
        openApiConfig.contact.email,
      )
      .addServer(openApiConfig.server)
      .addSecurity('api-key', {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'If required by the server, an API key must be provided by the client.',
      })
      .build(),
  )

  return cleanupOpenApiDoc(document, { version: '3.0' })
}
