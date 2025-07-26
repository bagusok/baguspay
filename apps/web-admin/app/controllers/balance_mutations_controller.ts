import { getBalanceMutationQueryValidator } from '#validators/balance_mutation'
import type { HttpContext } from '@adonisjs/core/http'
import { and, asc, count, db, desc, eq, gte, lte } from '@repo/db'
import { tb } from '@repo/db/types'
import vine from '@vinejs/vine'

export default class BalanceMutationsController {
  async index(ctx: HttpContext) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'desc',
      sortColumn = 'created_at',
      userId,
      endDate,
      startDate,
      type,
      refType,
    } = await ctx.request.validateUsing(vine.compile(getBalanceMutationQueryValidator), {
      data: ctx.request.qs(),
    })

    const where = []

    if (userId) {
      where.push(eq(tb.orders.user_id, userId))
    }

    if (type) {
      where.push(eq(tb.balanceMutations.type, type))
    }

    if (refType) {
      where.push(eq(tb.balanceMutations.ref_type, refType))
    }

    if (startDate) {
      where.push(lte(tb.balanceMutations.created_at, startDate))
    }

    if (endDate) {
      where.push(gte(tb.balanceMutations.created_at, endDate))
    }

    const orderBy = sortBy === 'asc' ? asc(tb.orders[sortColumn]) : desc(tb.orders[sortColumn])

    const mutations = await db.query.balanceMutations.findMany({
      columns: {
        id: true,
        amount: true,
        balance_after: true,
        balance_before: true,
        created_at: true,
        updated_at: true,
        name: true,
        ref_id: true,
        ref_type: true,
        type: true,
      },
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      where: and(...where),
      orderBy,
      limit,
      offset: (page - 1) * limit,
    })

    const [total] = await db
      .select({
        count: count(),
      })
      .from(tb.balanceMutations)
      .where(and(...where))

    return ctx.inertia.render('balance-mutations/index', {
      mutations,
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
      filters: {
        type,
        refType,
        startDate,
        endDate,
        userId,
        sortBy,
        sortColumn,
      },
    })
  }
}
