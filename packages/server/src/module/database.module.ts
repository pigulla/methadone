import { Module } from '@nestjs/common'

import { IDatabase } from '#infrastructure/persistence/database.interface.js'
import { Database } from '#infrastructure/persistence/database.js'

export const KYSLEY = Symbol('kysely')

@Module({
  providers: [
    {
      provide: IDatabase,
      useClass: Database,
    },
    {
      provide: KYSLEY,
      inject: [IDatabase],
      useFactory(database: IDatabase) {
        return database.instance
      },
    },
  ],
  exports: [IDatabase, KYSLEY],
})
export class DatabaseModule {}
