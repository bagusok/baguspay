import {
  changeStatusValidator,
  depositIdValidator,
  getDepositQueryValidator,
} from '#validators/deposit'
import type { HttpContext } from '@adonisjs/core/http'
import { and, asc, count, db, desc, eq } from '@repo/db'
import { BalanceMutationRefType, BalanceMutationType, DepositStatus, tb } from '@repo/db/types'
import vine from '@vinejs/vine'

export default class DepositsController {
  async index(ctx: HttpContext) {
    const {
      page = 1,
      limit = 10,
      depositId,
      sortBy = 'desc',
      sortColumn = 'created_at',
      status,
      userId,
    } = await ctx.request.validateUsing(vine.compile(getDepositQueryValidator), {
      data: ctx.request.qs(),
    })

    const where = []

    if (depositId) {
      where.push(eq(tb.deposits.deposit_id, depositId))
    }

    if (status) {
      where.push(eq(tb.deposits.status, status))
    }

    if (userId) {
      where.push(eq(tb.deposits.user_id, userId))
    }

    const orderBy = sortBy === 'asc' ? asc(tb.deposits[sortColumn]) : desc(tb.deposits[sortColumn])

    const deposits = await db.query.deposits.findMany({
      columns: {
        deposit_id: true,
        amount_received: true,
        amount_fee: true,
        amount_pay: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        payment_method: {
          columns: {
            id: true,
            name: true,
            type: true,
            provider_name: true,
          },
        },
      },
      where: and(...where),
      orderBy: orderBy,
      limit: limit,
      offset: (page - 1) * limit,
    })

    const [total] = await db
      .select({
        count: count(),
      })
      .from(tb.deposits)
      .where(and(...where))

    return ctx.inertia.render('deposits/index', {
      deposits,
      pagination: {
        total: total.count,
        page,
        limit,
        totalPages: Math.ceil(total.count / limit),
      },
      filters: {
        depositId,
        status,
        userId,
        sortBy,
        sortColumn,
      },
    })
  }

  async getById(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(depositIdValidator), {
      data: ctx.request.params(),
    })

    const deposit = await db.query.deposits.findFirst({
      where: eq(tb.deposits.deposit_id, id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        payment_method: {
          columns: {
            id: true,
            name: true,
            type: true,
            provider_name: true,
          },
        },
      },
    })

    return ctx.response.json({
      data: deposit,
      message: 'Deposit details retrieved successfully',
      success: true,
    })
  }

  async changeStatus(ctx: HttpContext) {
    const { status, updateBalance = false } = await ctx.request.validateUsing(
      vine.compile(changeStatusValidator),
      {
        data: ctx.request.body(),
      }
    )

    const id = await ctx.request.validateUsing(vine.compile(depositIdValidator), {
      data: ctx.request.params(),
    })

    const deposit = await db.query.deposits.findFirst({
      where: eq(tb.deposits.deposit_id, id.id),
    })

    if (!deposit) {
      ctx.session.flashErrors({
        error: 'Deposit not found',
      })
      return ctx.response.redirect().back()
    }

    if (deposit.status !== status) {
      if (deposit.status !== DepositStatus.COMPLETED && status === DepositStatus.COMPLETED) {
        const [updatedDeposit] = await db.transaction(async (tx) => {
          const [a] = await tx
            .update(tb.deposits)
            .set({
              status: status,
            })
            .where(eq(tb.deposits.deposit_id, ctx.request.param('id')))
            .returning()

          if (updateBalance) {
            const [user] = await tx
              .select()
              .from(tb.users)
              .where(eq(tb.users.id, deposit.user_id))
              .for('update')
              .limit(1)

            await tx
              .update(tb.users)
              .set({
                balance: user.balance + deposit.amount_received,
              })
              .where(eq(tb.users.id, deposit.user_id))

            await tx.insert(tb.balanceMutations).values({
              name: `Balance Adjustment #${deposit.deposit_id}`,
              user_id: deposit.user_id,
              amount: deposit.amount_received,
              type: BalanceMutationType.CREDIT,
              balance_after: user.balance + deposit.amount_received,
              balance_before: user.balance,
              ref_id: deposit.deposit_id,
              ref_type: BalanceMutationRefType.DEPOSIT,
              notes: `Admin Change Status:  ${deposit.status} -> ${status}`,
            })
          }

          return [a]
        })

        ctx.session.flash({
          success: `Deposit status changed from ${deposit.status} to ${updatedDeposit.status}`,
        })
        return ctx.response.redirect().back()
      } else if (deposit.status === DepositStatus.COMPLETED && status !== DepositStatus.COMPLETED) {
        const [updatedDeposit] = await db.transaction(async (tx) => {
          const [a] = await tx
            .update(tb.deposits)
            .set({
              status: status,
            })
            .where(eq(tb.deposits.deposit_id, ctx.request.param('id')))
            .returning()

          if (updateBalance) {
            const [user] = await tx
              .select()
              .from(tb.users)
              .where(eq(tb.users.id, deposit.user_id))
              .for('update')
              .limit(1)

            await tx
              .update(tb.users)
              .set({
                balance: user.balance - deposit.amount_received,
              })
              .where(eq(tb.users.id, deposit.user_id))

            await tx.insert(tb.balanceMutations).values({
              name: `Balance Adjustment #${deposit.deposit_id}`,
              user_id: deposit.user_id,
              amount: -deposit.amount_received,
              type: BalanceMutationType.DEBIT,
              balance_after: user.balance - deposit.amount_received,
              balance_before: user.balance,
              ref_id: deposit.deposit_id,
              ref_type: BalanceMutationRefType.DEPOSIT,
              notes: `Admin Change Status:  ${deposit.status} -> ${status}`,
            })
          }

          return [a]
        })

        ctx.session.flash({
          success: `Deposit status changed from ${deposit.status} to ${updatedDeposit.status}`,
        })

        return ctx.response.redirect().back()
      } else {
        await db
          .update(tb.deposits)
          .set({
            status: status,
          })
          .where(eq(tb.deposits.deposit_id, ctx.request.param('id')))

        ctx.session.flash({
          success: `Deposit status changed from ${deposit.status} to ${status}`,
        })

        return ctx.response.redirect().back()
      }
    } else {
      ctx.session.flashErrors({
        error: 'Deposit status is already set to the requested status',
      })
      return ctx.response.redirect().back()
    }
  }
}
