import type { Transaction } from '@electric-sql/pglite'
import type { TransactionalAdapter, TransactionalAdapterOptions } from '@nestjs-cls/transactional'

import { IDatabase } from './database.interface.js'

export type PgliteTxOptions = {
  deferConstraints: boolean
}

export type Connection = Pick<Transaction, 'query' | 'exec' | 'sql'>

export interface PgliteTransactionalAdapterOptions {
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
    instance: IDatabase,
  ): TransactionalAdapterOptions<Connection, PgliteTxOptions> {
    return {
      wrapWithTransaction(
        options: PgliteTxOptions,
        fn: (...args: unknown[]) => Promise<unknown>,
        setTx: (tx: Transaction) => void,
      ): Promise<unknown> {
        return instance.instance.transaction(async tx => {
          setTx(tx)

          if (options.deferConstraints) {
            await tx.exec('SET CONSTRAINTS ALL DEFERRED;')
          }

          return fn()
        })
      },
      getFallbackInstance(): Connection {
        return instance.instance
      },
    }
  }
}
