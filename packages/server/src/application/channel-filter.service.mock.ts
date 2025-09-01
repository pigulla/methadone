import { type Mocked, vi } from 'vitest'

import type { IChannelFilterService } from './channel-filter.service.interface.js'

export type ChannelFilterServiceMock = Mocked<IChannelFilterService>

export function mockChannelFilterService(): ChannelFilterServiceMock {
  return {
    get: vi.fn(),
    getAll: vi.fn(),
    getAllForNetwork: vi.fn(),
  }
}
