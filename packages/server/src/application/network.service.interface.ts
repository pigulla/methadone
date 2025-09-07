import type { NetworkKey } from '@methadone/types'

import { Network } from '#domain/network/network.js'

export abstract class INetworkService {
  public abstract get(key: NetworkKey): Promise<Network>
  public abstract getAll(): Promise<Network[]>
}
