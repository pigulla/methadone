import { type Mocked, vi } from 'vitest'

import type { IStreamManager } from './stream-manager.interface.js'

export type StreamManagerMock = Mocked<IStreamManager>

export function mockStreamManager(): StreamManagerMock {
  return {
    getMimeType: vi.fn(),
    getStream: vi.fn(),
    startStream: vi.fn(),
    startStreamTo: vi.fn(),
    stop: vi.fn(),
    getInformation: vi.fn(),
  }
}
