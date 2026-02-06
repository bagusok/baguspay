import type { HttpContext } from '@adonisjs/core/http'
import { and, asc, count, db, desc, eq, gte, sql, sum } from '@repo/db'
import { DepositStatus, OrderStatus, PaymentStatus, tb } from '@repo/db/types'

export default class HomeController {
  public async index(ctx: HttpContext) {
    const range = (ctx.request.qs().range as string) || '30d'
    const now = new Date()
    let start: Date | null = null

    if (range === 'today') {
      start = new Date(now)
      start.setHours(0, 0, 0, 0)
    } else if (range === '7d') {
      start = new Date(now)
      start.setDate(now.getDate() - 7)
    } else if (range === '30d') {
      start = new Date(now)
      start.setDate(now.getDate() - 30)
    } else if (range === '90d') {
      start = new Date(now)
      start.setDate(now.getDate() - 90)
    }

    const orderWhere = []
    if (start) {
      orderWhere.push(gte(tb.orders.created_at, start))
    }

    const [orderSummary] = await db
      .select({
        totalOrders: count(tb.orders.id),
        totalRevenue: sum(tb.orders.total_price),
        totalProfit: sum(tb.orders.profit),
        totalDiscount: sum(tb.orders.discount_price),
      })
      .from(tb.orders)
      .where(orderWhere.length ? and(...orderWhere) : undefined)
      .limit(1)

    const paymentStatusCounts = await db
      .select({
        status: tb.orders.payment_status,
        count: count(),
      })
      .from(tb.orders)
      .where(orderWhere.length ? and(...orderWhere) : undefined)
      .groupBy(tb.orders.payment_status)

    const orderStatusCounts = await db
      .select({
        status: tb.orders.order_status,
        count: count(),
      })
      .from(tb.orders)
      .where(orderWhere.length ? and(...orderWhere) : undefined)
      .groupBy(tb.orders.order_status)

    const completedOrderWhere = [...orderWhere, eq(tb.orders.order_status, OrderStatus.COMPLETED)]
    const salesTrend = await db
      .select({
        day: sql`date_trunc('day', ${tb.orders.created_at})`.as('day'),
        totalSales: sum(tb.orders.total_price),
        totalProfit: sum(tb.orders.profit),
      })
      .from(tb.orders)
      .where(and(...completedOrderWhere))
      .groupBy(sql`date_trunc('day', ${tb.orders.created_at})`)
      .orderBy(asc(sql`date_trunc('day', ${tb.orders.created_at})`))

    const topProducts = await db
      .select({
        product_name: tb.productSnapshots.name,
        category_name: tb.productSnapshots.category_name,
        total_orders: count(tb.orders.id),
        completed_orders:
          sql`sum(case when ${tb.orders.order_status} = ${OrderStatus.COMPLETED} then 1 else 0 end)`.as(
            'completed_orders',
          ),
      })
      .from(tb.orders)
      .innerJoin(tb.productSnapshots, eq(tb.orders.product_snapshot_id, tb.productSnapshots.id))
      .where(orderWhere.length ? and(...orderWhere) : undefined)
      .groupBy(tb.productSnapshots.name, tb.productSnapshots.category_name)
      .orderBy(
        desc(
          sql`sum(case when ${tb.orders.order_status} = ${OrderStatus.COMPLETED} then 1 else 0 end)`,
        ),
      )
      .limit(10)

    const topCategories = await db
      .select({
        category_name: tb.productSnapshots.category_name,
        total_orders: count(tb.orders.id),
        completed_orders:
          sql`sum(case when ${tb.orders.order_status} = ${OrderStatus.COMPLETED} then 1 else 0 end)`.as(
            'completed_orders',
          ),
      })
      .from(tb.orders)
      .innerJoin(tb.productSnapshots, eq(tb.orders.product_snapshot_id, tb.productSnapshots.id))
      .where(orderWhere.length ? and(...orderWhere) : undefined)
      .groupBy(tb.productSnapshots.category_name)
      .orderBy(
        desc(
          sql`sum(case when ${tb.orders.order_status} = ${OrderStatus.COMPLETED} then 1 else 0 end)`,
        ),
      )
      .limit(10)

    const topUsers = await db
      .select({
        user_id: tb.users.id,
        user_name: tb.users.name,
        user_email: tb.users.email,
        total_orders: count(tb.orders.id),
        completed_orders:
          sql`sum(case when ${tb.orders.order_status} = ${OrderStatus.COMPLETED} then 1 else 0 end)`.as(
            'completed_orders',
          ),
      })
      .from(tb.orders)
      .innerJoin(tb.users, eq(tb.orders.user_id, tb.users.id))
      .where(orderWhere.length ? and(...orderWhere) : undefined)
      .groupBy(tb.users.id, tb.users.name, tb.users.email)
      .orderBy(
        desc(
          sql`sum(case when ${tb.orders.order_status} = ${OrderStatus.COMPLETED} then 1 else 0 end)`,
        ),
      )
      .limit(10)

    const orderTrend = await db
      .select({
        day: sql`date_trunc('day', ${tb.orders.created_at})`.as('day'),
        revenue: sum(tb.orders.total_price),
        totalOrders: count(tb.orders.id),
        paymentSuccess:
          sql`sum(case when ${tb.orders.payment_status} = ${PaymentStatus.SUCCESS} then 1 else 0 end)`.as(
            'payment_success',
          ),
        paymentFailed:
          sql`sum(case when ${tb.orders.payment_status} = ${PaymentStatus.FAILED} then 1 else 0 end)`.as(
            'payment_failed',
          ),
        orderSuccess:
          sql`sum(case when ${tb.orders.order_status} = ${OrderStatus.COMPLETED} then 1 else 0 end)`.as(
            'order_success',
          ),
        orderFailed:
          sql`sum(case when ${tb.orders.order_status} = ${OrderStatus.FAILED} then 1 else 0 end)`.as(
            'order_failed',
          ),
      })
      .from(tb.orders)
      .where(orderWhere.length ? and(...orderWhere) : undefined)
      .groupBy(sql`date_trunc('day', ${tb.orders.created_at})`)
      .orderBy(asc(sql`date_trunc('day', ${tb.orders.created_at})`))

    const [userSummary] = await db
      .select({
        totalUsers: count(tb.users.id),
      })
      .from(tb.users)
      .limit(1)

    const depositWhere = [eq(tb.deposits.status, DepositStatus.COMPLETED)]
    if (start) {
      depositWhere.push(gte(tb.deposits.created_at, start))
    }

    const [depositSummary] = await db
      .select({
        totalDeposit: sum(tb.deposits.amount_received),
      })
      .from(tb.deposits)
      .where(and(...depositWhere))
      .limit(1)

    const recentOrders = await db.query.orders.findMany({
      columns: {
        order_id: true,
        total_price: true,
        payment_status: true,
        order_status: true,
        created_at: true,
      },
      with: {
        user: {
          columns: {
            id: true,
            name: true,
          },
        },
        product_snapshot: {
          columns: {
            name: true,
            category_name: true,
            sub_category_name: true,
          },
        },
      },
      where: orderWhere.length ? and(...orderWhere) : undefined,
      orderBy: desc(tb.orders.created_at),
      limit: 6,
    })

    const revenueTrend = orderTrend.map((row) => ({
      date: row.day instanceof Date ? row.day.toISOString().slice(0, 10) : String(row.day),
      revenue: Number(row.revenue ?? 0),
      totalOrders: Number(row.totalOrders ?? 0),
      paymentSuccess: Number(row.paymentSuccess ?? 0),
      paymentFailed: Number(row.paymentFailed ?? 0),
      orderSuccess: Number(row.orderSuccess ?? 0),
      orderFailed: Number(row.orderFailed ?? 0),
    }))

    const salesProfitTrend = salesTrend.map((row) => ({
      date: row.day instanceof Date ? row.day.toISOString().slice(0, 10) : String(row.day),
      totalSales: Number(row.totalSales ?? 0),
      totalProfit: Number(row.totalProfit ?? 0),
    }))

    return ctx.inertia.render('home', {
      title: 'Dashboard',
      description: 'Overview of recent performance and activity.',
      range,
      summary: {
        totalOrders: orderSummary?.totalOrders ?? 0,
        totalRevenue: orderSummary?.totalRevenue ?? '0',
        totalProfit: orderSummary?.totalProfit ?? '0',
        totalDiscount: orderSummary?.totalDiscount ?? '0',
        totalUsers: userSummary?.totalUsers ?? 0,
        totalDeposit: depositSummary?.totalDeposit ?? '0',
      },
      paymentStatusCounts,
      orderStatusCounts,
      revenueTrend,
      salesProfitTrend,
      topProducts,
      topCategories,
      topUsers,
      recentOrders,
    })
  }
}
