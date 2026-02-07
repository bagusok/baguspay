import { Injectable } from '@nestjs/common'
import { and, count, desc, eq, gte, type InferInsertModel, lte, type SQL, sql, sum } from '@repo/db'
import { type BalanceMutationType, DepositStatus, OrderStatus, tb } from '@repo/db/types'
import type { DBInstance } from 'src/common/types/db-instance'
import { DatabaseService } from 'src/database/database.service'
import type { GetBalanceMutationHistoryQuery } from './user.dto'

export interface DateRange {
  start: Date
  end: Date
}

@Injectable()
export class UserRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async updateUser(
    data: Partial<InferInsertModel<typeof tb.users>>,
    userId: string,
    tx?: DBInstance,
  ) {
    const db = tx ?? this.databaseService.db
    const [user] = await db.update(tb.users).set(data).where(eq(tb.users.id, userId)).returning({
      id: tb.users.id,
    })

    return user
  }

  async findUserById(userId: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    const user = await db.query.users.findFirst({
      where: eq(tb.users.id, userId),
    })
    return user
  }

  async findPhoneNumber(phone: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    const user = await db.query.users.findFirst({
      where: eq(tb.users.phone, phone),
    })
    return user
  }

  async findEmail(email: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    const user = await db.query.users.findFirst({
      where: eq(tb.users.email, email),
    })
    return user
  }

  async findAllBalanceMutationByUserId(
    userId: string,
    query: GetBalanceMutationHistoryQuery,
    tx?: DBInstance,
  ) {
    const where: SQL[] = [eq(tb.balanceMutations.user_id, userId)]

    if (query.start_date) {
      where.push(gte(tb.balanceMutations.created_at, new Date(query.start_date)))
    }

    if (query.end_date) {
      where.push(lte(tb.balanceMutations.created_at, new Date(query.end_date)))
    }

    if (query.ref_type) {
      where.push(eq(tb.balanceMutations.ref_type, query.ref_type))
    }

    if (query.type) {
      where.push(eq(tb.balanceMutations.type, query.type))
    }

    const db = tx ?? this.databaseService.db

    const balanceMutations = await db.query.balanceMutations.findMany({
      where: and(...where),
      orderBy: [desc(tb.balanceMutations.created_at), desc(tb.balanceMutations.name)],
      limit: query.limit,
      offset: (query.page - 1) * query.limit,
      columns: {
        id: true,
        name: true,
        amount: true,
        type: true,
        created_at: true,
      },
    })
    return balanceMutations
  }

  async findBalanceMuationById(id: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    const balanceMutation = await db.query.balanceMutations.findFirst({
      where: eq(tb.balanceMutations.id, id),
    })
    return balanceMutation
  }

  async countBalanceMutationsByUserId(
    userId: string,
    query: GetBalanceMutationHistoryQuery,
    tx?: DBInstance,
  ) {
    const where: SQL[] = [eq(tb.balanceMutations.user_id, userId)]

    if (query.start_date) {
      where.push(gte(tb.balanceMutations.created_at, new Date(query.start_date)))
    }

    if (query.end_date) {
      where.push(lte(tb.balanceMutations.created_at, new Date(query.end_date)))
    }

    if (query.ref_type) {
      where.push(eq(tb.balanceMutations.ref_type, query.ref_type))
    }

    if (query.type) {
      where.push(eq(tb.balanceMutations.type, query.type))
    }

    const db = tx ?? this.databaseService.db

    const [totalData] = await db
      .select({
        count: count(tb.balanceMutations.id),
      })
      .from(tb.balanceMutations)
      .where(and(...where))

    return totalData.count
  }

  // ==================== Dashboard Methods ====================

  async getOrderStats(userId: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    const [result] = await db
      .select({
        totalPrice: sum(tb.orders.total_price),
        totalPromo: sum(tb.orders.discount_price),
        totalOrder: count(tb.orders.id),
      })
      .from(tb.orders)
      .where(and(eq(tb.orders.user_id, userId), eq(tb.orders.order_status, OrderStatus.COMPLETED)))
      .limit(1)

    return result
  }

  async getMonthlyOrderStats(userId: string, dateRange: DateRange, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    const [result] = await db
      .select({
        totalPrice: sum(tb.orders.total_price),
        totalPromo: sum(tb.orders.discount_price),
        totalOrder: count(tb.orders.id),
      })
      .from(tb.orders)
      .where(
        and(
          eq(tb.orders.user_id, userId),
          eq(tb.orders.order_status, OrderStatus.COMPLETED),
          gte(tb.orders.created_at, dateRange.start),
          lte(tb.orders.created_at, dateRange.end),
        ),
      )
      .limit(1)

    return result
  }

  async getBalanceMutationSum(
    userId: string,
    type: BalanceMutationType,
    dateRange: DateRange,
    tx?: DBInstance,
  ) {
    const db = tx ?? this.databaseService.db
    const [result] = await db
      .select({
        total: sum(tb.balanceMutations.amount),
      })
      .from(tb.balanceMutations)
      .where(
        and(
          eq(tb.balanceMutations.user_id, userId),
          eq(tb.balanceMutations.type, type),
          gte(tb.balanceMutations.created_at, dateRange.start),
          lte(tb.balanceMutations.created_at, dateRange.end),
        ),
      )
      .limit(1)

    return result?.total ?? '0'
  }

  async getTotalDeposit(userId: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    const [result] = await db
      .select({
        totalDeposit: sum(tb.deposits.amount_received),
      })
      .from(tb.deposits)
      .where(and(eq(tb.deposits.user_id, userId), eq(tb.deposits.status, DepositStatus.COMPLETED)))
      .limit(1)

    return result?.totalDeposit ?? '0'
  }

  async getRecentOrders(userId: string, limit = 5, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    return db.query.orders.findMany({
      where: eq(tb.orders.user_id, userId),
      orderBy: desc(tb.orders.created_at),
      limit,
      columns: {
        order_id: true,
        total_price: true,
        order_status: true,
        payment_status: true,
        customer_input: true,
        created_at: true,
      },
      with: {
        product_snapshot: {
          columns: {
            name: true,
            category_name: true,
            sub_category_name: true,
          },
        },
      },
    })
  }

  async getPopularOrderCategories(
    userId: string,
    dateRange: DateRange,
    limit = 5,
    tx?: DBInstance,
  ) {
    const db = tx ?? this.databaseService.db
    return db
      .select({
        category_name: tb.productSnapshots.category_name,
        total: count(tb.orders.id).as('total'),
      })
      .from(tb.orders)
      .innerJoin(tb.productSnapshots, eq(tb.orders.product_snapshot_id, tb.productSnapshots.id))
      .where(
        and(
          eq(tb.orders.user_id, userId),
          eq(tb.orders.order_status, OrderStatus.COMPLETED),
          gte(tb.orders.created_at, dateRange.start),
          lte(tb.orders.created_at, dateRange.end),
        ),
      )
      .groupBy(tb.productSnapshots.category_name)
      .orderBy(desc(sql`count(${tb.orders.id})`))
      .limit(limit)
  }

  async findAllSessionByUserId(userId: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    const sessions = await db.query.sessions.findMany({
      where: eq(tb.sessions.user_id, userId),
      orderBy: desc(tb.sessions.updated_at),
      columns: {
        id: true,
        access_token: true,
        ip_address: true,
        user_agent: true,
        device_id: true,
        device_name: true,
        device_fingerprint: true,
        is_from: true,
        created_at: true,
        updated_at: true,
      },
    })
    return sessions
  }

  async deleteSessionByIdAndUserId(sessionId: string, userId: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    return await db
      .delete(tb.sessions)
      .where(and(eq(tb.sessions.id, sessionId), eq(tb.sessions.user_id, userId)))
      .returning({
        id: tb.sessions.id,
      })
  }

  async findSessionByIdAndUserId(sessionId: string, userId: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db
    return db.query.sessions.findFirst({
      where: and(eq(tb.sessions.id, sessionId), eq(tb.sessions.user_id, userId)),
    })
  }
}
