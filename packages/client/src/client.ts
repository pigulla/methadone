import { NetworkDTO, networkDtoSchema } from '@methadone/dto'

import type { KyInstance } from 'ky'
import ky from 'ky'
import type { JsonValue } from 'type-fest'

import { type Options, optionsSchema } from './options.js'

export class Client {
  private readonly ky: KyInstance

  public constructor(options: Options) {
    const { url } = optionsSchema.parse(options)

    this.ky = ky.extend({ prefixUrl: url })
  }

  public async getNetworks(): Promise<NetworkDTO> {
    const response = await this.ky.get('networks').json<JsonValue>()

    return networkDtoSchema.parse(response)
  }
}
