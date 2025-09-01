import { Transactional as NestjsClsTransactional } from '@nestjs-cls/transactional'

import type { TransactionalAdapterPglite } from '#infrastructure/persistence/transactional-adapter-pglite.js'

export const Transactional = NestjsClsTransactional<TransactionalAdapterPglite>
