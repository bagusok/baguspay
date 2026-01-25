import { Injectable } from '@nestjs/common'
import { and, arrayContains, count, desc, eq, gte, InferInsertModel, lte, ne, SQL } from '@repo/db'
import {
  DepositStatus,
  PaymentMethodAllowAccess,
  PaymentMethodProvider,
  PaymentMethodType,
  tb,
} from '@repo/db/types'
import { DBInstance } from 'src/common/types/db-instance'
import { DatabaseService } from 'src/database/database.service'
import { DepositHistoryQuery } from './deposit.dto'

@Injectable()
export class DepositRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findDepositById(depositId: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db

    const deposit = await db.query.deposits.findFirst({
      where: eq(tb.deposits.deposit_id, depositId),
    })

    return deposit
  }

  async findDepositByIdWithRelation(depositId: string, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db

    const deposit = await db.query.deposits.findFirst({
      where: eq(tb.deposits.deposit_id, depositId),
      with: {
        payment_method: {
          columns: {
            name: true,
            type: true,
            image_url: true,
            instruction: true,
          },
        },
      },
    })

    return deposit
  }

  async updateDepositStatus(depositId: string, status: DepositStatus, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db

    return await db
      .update(tb.deposits)
      .set({
        status: status,
      })
      .where(eq(tb.deposits.deposit_id, depositId))
  }

  async findPaymentMethod() {
    const payments = await this.databaseService.db.query.paymentMethodCategories.findMany({
      columns: {
        name: true,
      },
      with: {
        payment_methods: {
          columns: {
            id: true,
            name: true,
            fee_type: true,
            type: true,
            fee_static: true,
            fee_percentage: true,
            image_url: true,
            is_need_email: true,
            is_need_phone_number: true,
            is_available: true,
            is_featured: true,
            label: true,
            min_amount: true,
            max_amount: true,
            cut_off_start: true,
            cut_off_end: true,
          },
          where: and(
            arrayContains(tb.paymentMethods.allow_access, [PaymentMethodAllowAccess.DEPOSIT]),
            ne(tb.paymentMethods.type, PaymentMethodType.BALANCE),
            ne(tb.paymentMethods.provider_name, PaymentMethodProvider.BALANCE),
          ),
        },
      },
    })

    return payments
  }

  async findPaymentMethodById(paymentMethodId: string) {
    const payment = await this.databaseService.db.query.paymentMethods.findFirst({
      where: and(
        eq(tb.paymentMethods.id, paymentMethodId),
        eq(tb.paymentMethods.is_available, true),
        eq(tb.paymentMethods.is_deleted, false),
        arrayContains(tb.paymentMethods.allow_access, [PaymentMethodAllowAccess.DEPOSIT]),
        ne(tb.paymentMethods.type, PaymentMethodType.BALANCE),
        ne(tb.paymentMethods.provider_name, PaymentMethodProvider.BALANCE),
      ),
    })

    return payment
  }

  async findAllDepositHistory(query: DepositHistoryQuery, userId: string) {
    const { page, limit, deposit_id, start_date, end_date } = query

    const where: SQL[] = [eq(tb.deposits.user_id, userId)]

    if (deposit_id) {
      where.push(eq(tb.deposits.deposit_id, deposit_id))
    }

    if (start_date) {
      where.push(gte(tb.deposits.created_at, new Date(start_date)))
    }

    if (end_date) {
      where.push(lte(tb.deposits.created_at, new Date(end_date)))
    }

    const deposits = await this.databaseService.db.query.deposits.findMany({
      where: and(...where),
      limit: limit,
      offset: (page - 1) * limit,
      orderBy: desc(tb.deposits.created_at),
      columns: {
        deposit_id: true,
        amount_pay: true,
        created_at: true,
        expired_at: true,
        status: true,
      },
      with: {
        payment_method: {
          columns: {
            name: true,
            image_url: true,
          },
        },
      },
    })

    return deposits
  }

  async countDepositHistory(query: DepositHistoryQuery, userId: string) {
    const { deposit_id, start_date, end_date } = query

    const where: SQL[] = [eq(tb.deposits.user_id, userId)]

    if (deposit_id) {
      where.push(eq(tb.deposits.deposit_id, deposit_id))
    }

    if (start_date) {
      where.push(gte(tb.deposits.created_at, new Date(start_date)))
    }

    if (end_date) {
      where.push(lte(tb.deposits.created_at, new Date(end_date)))
    }

    const [total] = await this.databaseService.db
      .select({
        count: count(),
      })
      .from(tb.deposits)
      .where(and(...where))
    return total.count
  }

  async createDeposit(depositData: InferInsertModel<typeof tb.deposits>, tx?: DBInstance) {
    const db = tx ?? this.databaseService.db

    const [deposit] = await db.insert(tb.deposits).values(depositData).returning({
      id: tb.deposits.id,
      deposit_id: tb.deposits.deposit_id,
      expired_at: tb.deposits.expired_at,
    })

    return deposit
  }
}
