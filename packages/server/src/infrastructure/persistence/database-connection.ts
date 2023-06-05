import Database from 'better-sqlite3'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'

import { type IDatabaseConnection } from './database-connection.interface'

export class DatabaseConnection implements IDatabaseConnection {
    public readonly db: Database.Database
    private readonly logger: PinoLogger

    public constructor(
        @InjectPinoLogger(DatabaseConnection.name) logger: PinoLogger,
    ) {
        this.logger = logger
        this.db = new Database(':memory:', {
            timeout: 1_000,
            verbose: (statement?: unknown, ...parameters: unknown[]) =>
                this.logger.trace({ statement, parameters }),
        })
        this.db.pragma('journal_mode = WAL')
    }
}
