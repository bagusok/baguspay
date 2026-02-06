import { Injectable } from '@nestjs/common'
import { and, eq } from '@repo/db'
import { PaymentMethodProvider, PaymentMethodType, tb } from '@repo/db/types'
import type { DatabaseService } from 'src/database/database.service'

@Injectable()
export class PaymentsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findPaymentMethodByType(type: PaymentMethodType) {
    const paymentMethod = await this.databaseService.db.query.paymentMethods.findFirst({
      where: eq(tb.paymentMethods.type, type),
    })
    return paymentMethod
  }

  async findBalancePaymentMethod() {
    const paymentMethod = await this.databaseService.db.query.paymentMethods.findFirst({
      where: and(
        eq(tb.paymentMethods.type, PaymentMethodType.BALANCE),
        eq(tb.paymentMethods.provider_name, PaymentMethodProvider.BALANCE),
      ),
    })
    return paymentMethod
  }

  async getBalanceByUserId(userId: string) {
    const balance = await this.databaseService.db.query.users.findFirst({
      where: eq(tb.users.id, userId),
      columns: {
        balance: true,
      },
    })

    return balance.balance
  }
}
