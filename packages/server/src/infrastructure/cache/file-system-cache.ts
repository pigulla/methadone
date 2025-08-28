import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { Inject, Injectable, Logger } from '@nestjs/common'
import type { JsonObject, JsonValue } from 'type-fest'

import type { ICache } from './cache.interface.js'

export const CACHE_DIRECTORY = Symbol('cache-directory')

@Injectable()
export class FileSystemCache<M extends JsonObject> implements ICache<M> {
  private readonly logger = new Logger(FileSystemCache.name)
  private readonly cacheDirectory: string

  public constructor(@Inject(CACHE_DIRECTORY) cacheDirectory: string) {
    this.cacheDirectory = cacheDirectory
  }

  public async get<T extends JsonValue>(key: string): Promise<{ meta: M; value: T } | null> {
    const file = join(this.cacheDirectory, `${key}.json`)

    try {
      const buffer = await readFile(file)

      this.logger.verbose(`Cache hit for "${key}"`)
      return JSON.parse(buffer.toString())
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        this.logger.verbose(`Cache miss for "${key}"`)
        return null
      }
      throw error
    }
  }

  public async set<T extends JsonValue>(key: string, value: T, meta: M): Promise<void> {
    const file = join(this.cacheDirectory, `${key}.json`)

    this.logger.verbose(`Cache updated for "${key}"`)
    await writeFile(file, JSON.stringify({ meta, value }))
  }
}
