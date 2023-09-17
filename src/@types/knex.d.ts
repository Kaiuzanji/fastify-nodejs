// eslint-disable-next-line
import { Knex } from 'knex'

interface Transaction {
  id: string
  title: string
  amount: number
  session_id?: string
  created_at: string
}

declare module 'knex/types/tables' {
  interface Tables {
    transaction: Transaction
  }
}
