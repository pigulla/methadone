import { PGlite } from '@electric-sql/pglite'

export abstract class IDatabase {
  public abstract readonly instance: PGlite
}
