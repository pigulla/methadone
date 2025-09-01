import { type Mocked, vi } from 'vitest'

import type { INetworkService } from './network.service.interface.js'

export type NetworkServiceMock = Mocked<INetworkService>

export function mockNetworkService(): NetworkServiceMock {
  return {
    get: vi.fn(),
    getAll: vi.fn(),
  }
}
