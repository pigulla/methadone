import { type Mocked, vi } from 'vitest'

import type { IChannelService } from './channel.service.interface.js'

export type ChannelServiceMock = Mocked<IChannelService>

export function mockChannelService(): ChannelServiceMock {
  return {
    get: vi.fn(),
    getCurrentlyPlayingOnChannel: vi.fn(),
    getCurrentlyPlayingOnNetwork: vi.fn(),
    getAllForNetwork: vi.fn(),
  }
}
