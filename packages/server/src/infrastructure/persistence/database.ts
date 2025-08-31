import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { PGlite } from '@electric-sql/pglite'
import { Injectable, Logger, type OnApplicationShutdown, type OnModuleInit } from '@nestjs/common'

import type { IDatabase } from './database.interface.js'

@Injectable()
export class Database implements IDatabase, OnModuleInit, OnApplicationShutdown {
  public readonly instance: PGlite

  private readonly logger = new Logger(Database.name)

  public constructor() {
    this.instance = new PGlite()
  }

  public async onModuleInit(): Promise<void> {
    this.logger.debug('Creating database tables')

    const file = join(import.meta.dirname, 'sql', 'create-tables.sql')
    const sql = (await readFile(file, 'utf8')).toString()

    await this.instance.exec(sql)
  }

  public async onApplicationShutdown(_signal?: string): Promise<void> {
    this.logger.debug('Disconnecting from database')
    await this.instance.close()
  }
}
