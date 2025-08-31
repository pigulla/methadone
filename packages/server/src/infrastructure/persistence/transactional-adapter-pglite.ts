import type { Transaction } from '@electric-sql/pglite'
import type { TransactionalAdapter, TransactionalAdapterOptions } from '@nestjs-cls/transactional'
import type { EmptyObject } from 'type-fest'

import { IDatabase } from './database.interface.js'

type PgliteTxOptions = EmptyObject

export type Connection = Pick<Transaction, 'query' | 'exec' | 'sql'>

export interface PgPromiseTransactionalAdapterOptions {
  dbInstanceToken: any
  defaultTxOptions?: PgliteTxOptions
}

export class TransactionalAdapterPglite
  implements TransactionalAdapter<IDatabase, Connection, PgliteTxOptions>
{
  public connectionToken: any
  public defaultTxOptions?: Partial<PgliteTxOptions>

  public constructor(options: PgPromiseTransactionalAdapterOptions) {
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
      ) {
        return instance.instance.transaction(tx => {
          setTx(tx)
          return fn()
        })
      },
      getFallbackInstance(): Connection {
        return instance.instance
      },
    }
  }
}
