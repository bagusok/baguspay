import {
  getOrderQueryValidator,
  orderIdValidator,
  updateOrderPaymentStatusValidator,
  updateOrderRefundStatusValidator,
  updateOrderStatusValidator,
} from '#validators/order'
import type { HttpContext } from '@adonisjs/core/http'
import { and, asc, count, db, desc, eq } from '@repo/db'
import {
  BalanceMutationRefType,
  BalanceMutationType,
  OrderStatus,
  PaymentStatus,
  RefundStatus,
  tb,
} from '@repo/db/types'
import vine from '@vinejs/vine'

export default class OrdersController {
  async indexPrepaid(ctx: HttpContext) {
    const {
      page = 1,
      limit = 10,
      orderId,
      orderStatus,
      paymentStatus,
      refundStatus,
      sortBy = 'desc',
      sortColumn = 'created_at',
      userId,
    } = await ctx.request.validateUsing(vine.compile(getOrderQueryValidator), {
      data: ctx.request.qs(),
    })

    const where = []

    if (orderId) {
      where.push(eq(tb.orders.order_id, orderId))
    }

    if (orderStatus) {
      where.push(eq(tb.orders.order_status, orderStatus))
    }

    if (paymentStatus) {
      where.push(eq(tb.orders.payment_status, paymentStatus))
    }

    if (refundStatus) {
      where.push(eq(tb.orders.refund_status, refundStatus))
    }

    if (userId) {
      where.push(eq(tb.orders.user_id, userId))
    }

    const orderBy = sortBy === 'asc' ? asc(tb.orders[sortColumn]) : desc(tb.orders[sortColumn])

    const orders = await db.query.orders.findMany({
      columns: {
        order_id: true,
        price: true,
        cost_price: true,
        total_price: true,
        fee: true,
        profit: true,
        discount_price: true,
        order_status: true,
        payment_status: true,
        refund_status: true,
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
        offer_on_orders: true,
        payment_snapshot: {
          columns: {
            name: true,
            provider_name: true,
            type: true,
          },
        },
        product_snapshot: {
          columns: {
            id: true,
            name: true,
            provider_name: true,
            category_name: true,
            sub_category_name: true,
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
      .from(tb.orders)
      .where(and(...where))

    return ctx.inertia.render('orders/prepaid/index', {
      orders,
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
      filters: {
        orderId,
        orderStatus,
        paymentStatus,
        refundStatus,
        userId,
        sortBy,
        sortColumn,
      },
    })
  }

  async getById(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(orderIdValidator), {
      data: ctx.request.params(),
    })

    const order = await db.query.orders.findFirst({
      where: eq(tb.orders.order_id, id),
      with: {
        user: true,
        offer_on_orders: {
          with: {
            offer: true,
          },
        },
        payment_snapshot: true,
        product_snapshot: true,
      },
    })

    if (!order) {
      return ctx.response.json({
        success: false,
        message: 'Order not found',
      })
    }

    return ctx.response.json({
      success: true,
      order,
      message: 'Order details retrieved successfully',
    })
  }

  async changePaymentStatus(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(orderIdValidator), {
      data: ctx.request.params(),
    })

    const { status } = await ctx.request.validateUsing(
      vine.compile(updateOrderPaymentStatusValidator),
      {
        data: ctx.request.body(),
      }
    )

    const order = await db.query.orders.findFirst({
      where: eq(tb.orders.order_id, id),
    })

    if (!order) {
      ctx.session.flashErrors({
        error: 'Order not found',
      })
      return ctx.response.redirect().withQs().back()
    }

    if (order.payment_status === status) {
      ctx.session.flashErrors({
        error: 'Payment status is already set to this value',
      })
      return ctx.response.redirect().withQs().back()
    }

    await db.update(tb.orders).set({ payment_status: status }).where(eq(tb.orders.id, order.id))

    ctx.session.flash({
      success: 'Payment status updated successfully',
    })
    return ctx.response.redirect().withQs().back()
  }

  async changeOrderStatus(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(orderIdValidator), {
      data: ctx.request.params(),
    })

    const { status } = await ctx.request.validateUsing(vine.compile(updateOrderStatusValidator), {
      data: ctx.request.body(),
    })

    const order = await db.query.orders.findFirst({
      where: eq(tb.orders.order_id, id),
    })

    if (!order) {
      ctx.session.flashErrors({
        error: 'Order not found',
      })
      return ctx.response.redirect().withQs().back()
    }

    if (order.order_status === status) {
      ctx.session.flashErrors({
        error: 'Order status is already set to this value',
      })
      return ctx.response.redirect().withQs().back()
    }

    if (order.payment_status !== PaymentStatus.SUCCESS) {
      ctx.session.flashErrors({
        error: 'Order must have a successful payment status to change order status',
      })
      return ctx.response.redirect().withQs().back()
    }

    await db.update(tb.orders).set({ order_status: status }).where(eq(tb.orders.id, order.id))

    ctx.session.flash({
      success: 'Order status updated successfully',
    })
    return ctx.response.redirect().withQs().back()
  }

  async changeRefundStatus(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(orderIdValidator), {
      data: ctx.request.params(),
    })

    const { status } = await ctx.request.validateUsing(
      vine.compile(updateOrderRefundStatusValidator),
      {
        data: ctx.request.body(),
      }
    )

    const order = await db.query.orders.findFirst({
      where: eq(tb.orders.order_id, id),
    })

    if (!order) {
      ctx.session.flashErrors({
        error: 'Order not found',
      })
      return ctx.response.redirect().withQs().back()
    }

    if (order.refund_status === status) {
      ctx.session.flashErrors({
        error: 'Refund status is already set to this value',
      })
      return ctx.response.redirect().withQs().back()
    }

    if (
      order.payment_status !== PaymentStatus.SUCCESS &&
      order.order_status !== OrderStatus.FAILED
    ) {
      ctx.session.flashErrors({
        error:
          'Order must have a successful payment status and failed order status to change refund status',
      })
      return ctx.response.redirect().withQs().back()
    }

    await db.update(tb.orders).set({ refund_status: status }).where(eq(tb.orders.id, order.id))

    ctx.session.flash({
      success: 'Refund status updated successfully',
    })
    return ctx.response.redirect().withQs().back()
  }

  async refundToBalance(ctx: HttpContext) {
    const { id } = await ctx.request.validateUsing(vine.compile(orderIdValidator), {
      data: ctx.request.params(),
    })

    const order = await db.query.orders.findFirst({
      where: eq(tb.orders.order_id, id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
    if (!order) {
      ctx.session.flashErrors({
        error: 'Order not found',
      })
      return ctx.response.redirect().withQs().back()
    }

    if (order.user_id === null) {
      ctx.session.flashErrors({
        error:
          'Order with guest user cannot be refunded to balance, Please refund manually, and set the refund status to completed manually.',
      })
      return ctx.response.redirect().withQs().back()
    }

    if (
      order.payment_status !== PaymentStatus.SUCCESS &&
      order.order_status !== OrderStatus.FAILED
    ) {
      ctx.session.flashErrors({
        error:
          'Order must have a successful payment status and failed order status to refund to balance',
      })
      return ctx.response.redirect().withQs().back()
    }

    if (order.refund_status === RefundStatus.COMPLETED) {
      ctx.session.flashErrors({
        error: 'Order has already been refunded',
      })
      return ctx.response.redirect().withQs().back()
    }

    await db.transaction(async (tx) => {
      const [user] = await tx.select().from(tb.users).where(eq(tb.users.id, order.user_id)).limit(1)

      await tx
        .update(tb.users)
        .set({
          balance: user.balance + order.total_price - order.fee,
        })
        .where(eq(tb.users.id, order.user_id))

      await tx.insert(tb.balanceMutations).values({
        name: `Refund Order #${order.order_id}`,
        user_id: order.user_id,
        amount: order.total_price - order.fee,
        type: BalanceMutationType.CREDIT,
        balance_after: user.balance + order.total_price - order.fee,
        balance_before: user.balance,
        ref_id: order.order_id,
        ref_type: BalanceMutationRefType.ORDER,
        notes: `Admin Refund for order ${order.order_id}`,
      })

      await tx
        .update(tb.orders)
        .set({
          refund_status: RefundStatus.COMPLETED,
        })
        .where(eq(tb.orders.id, order.id))

      return [order, user]
    })

    ctx.session.flash({
      success: `Refunded ${order.total_price - order.fee} to user ${order.user.name} for order #${order.order_id}`,
    })
    return ctx.response.redirect().withQs().back()
  }
}
