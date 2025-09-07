import { Transactional as NestjsClsTransactional } from '@nestjs-cls/transactional'
import { TransactionalAdapterKysely } from '@nestjs-cls/transactional-adapter-kysely'

export const Transactional = NestjsClsTransactional<TransactionalAdapterKysely>
