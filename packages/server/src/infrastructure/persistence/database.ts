import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { PGlite } from '@electric-sql/pglite'
import { Injectable, Logger, type OnApplicationShutdown, type OnModuleInit } from '@nestjs/common'
import dayjs from 'dayjs'

import type { IDatabase } from './database.interface.js'

@Injectable()
export class Database implements IDatabase, OnModuleInit, OnApplicationShutdown {
  public readonly instance: PGlite

  private readonly logger = new Logger(Database.name)

  public constructor() {
    this.instance = new PGlite({
      parsers: {
        1114: /* TIMESTAMP */ value => dayjs(value),
        1184: /* TIMESTAMPTZ */ value => dayjs(value),
        1186: /* INTERVAL */ value => {
          // This may not work for things longer than 24 hours, but let's worry about that later.
          const [hours, minutes, seconds] = value.split(':').map(item => Number.parseInt(item, 10))
          return dayjs.duration({ hours, minutes, seconds })
        },
      },
    })
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
