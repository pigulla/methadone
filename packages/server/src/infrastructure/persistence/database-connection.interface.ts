import type Database from 'better-sqlite3'

export abstract class IDatabaseConnection {
    public abstract readonly db: Database.Database
}
