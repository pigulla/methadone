import type { Transaction } from '@electric-sql/pglite'
import type { TransactionalAdapter, TransactionalAdapterOptions } from '@nestjs-cls/transactional'

import { IDatabase } from './database.interface.js'

type PgliteTxOptions = {
  deferConstraints: boolean
}

type Connection = Pick<Transaction, 'query' | 'exec' | 'sql'>

interface PgliteTransactionalAdapterOptions {
  dbInstanceToken: unknown
  defaultTxOptions?: PgliteTxOptions
}

export class TransactionalAdapterPglite
  implements TransactionalAdapter<IDatabase, Connection, PgliteTxOptions>
{
  public connectionToken: unknown
  public defaultTxOptions?: Partial<PgliteTxOptions>

  public constructor(options: PgliteTransactionalAdapterOptions) {
    this.connectionToken = options.dbInstanceToken
    this.defaultTxOptions = options.defaultTxOptions
  }

  public optionsFactory(
    database: IDatabase,
  ): TransactionalAdapterOptions<Connection, PgliteTxOptions> {
    return {
      wrapWithTransaction(
        options: PgliteTxOptions,
        fn: (...args: unknown[]) => Promise<unknown>,
        setTx: (tx: Transaction) => void,
      ): Promise<unknown> {
        return database.instance.transaction(async tx => {
          setTx(tx)

          if (options.deferConstraints) {
            await tx.exec('SET CONSTRAINTS ALL DEFERRED;')
          }

          return fn()
        })
      },
      getFallbackInstance(): Connection {
        return database.instance
      },
    }
  }
}
