import {
  BadRequestException,
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common'
import type { Request } from 'express'

import { SERVER_CONFIG, type ServerConfig } from '#infrastructure/config/server.config.js'

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly apiKey: string | false

  public constructor(@Inject(SERVER_CONFIG) config: ServerConfig) {
    this.apiKey = config.apiKey
  }

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()

    if (this.apiKey === false) {
      return true
    }

    const apiKey = request.header('x-api-key')

    if (apiKey === undefined) {
      throw new BadRequestException(`Missing "X-Api-Key" header`)
    }

    return apiKey === this.apiKey
  }
}
