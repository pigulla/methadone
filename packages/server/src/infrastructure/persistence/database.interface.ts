import { Kysely } from 'kysely'

import type { DatabaseType } from '#infrastructure/persistence/types.js'

export abstract class IDatabase {
  public abstract readonly instance: Kysely<DatabaseType>
}
