import { randomUUID } from 'crypto'
import { knex } from '../database'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'
import { checkSessionIdExists } from '../middlewares/checkSessionIdExists'

export async function transactionRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies

    const transactions = await knex('transaction')
      .select('*')
      .where('session_id', sessionId)

    return {
      transactions,
    }
  })

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies

    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionParamsSchema.parse(request.params)

    const transaction = await knex('transaction')
      .select('*')
      .where({
        id,
        session_id: sessionId,
      })
      .first()

    return { transaction }
  })

  app.get('/summary', async (request) => {
    const { sessionId } = request.cookies

    const summary = await knex('transaction')
      .where('session_id', sessionId)
      .sum('amount', { as: 'amount' })
      .first()

    return { summary }
  })

  app.post('/', async (request, response) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, type, amount } = createTransactionBodySchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()
      response.cookie('sessionId', sessionId, {
        path: '/transaction', // rotas onde o cookie vai estar disponível
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transaction').insert({
      id: randomUUID(),
      title,
      session_id: sessionId,
      amount: type === 'credit' ? amount : amount * -1,
    })

    return response.status(201).send()
  })
}
