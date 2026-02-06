import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiSecurity } from '@nestjs/swagger'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import { TransactionGuard } from 'src/auth/guards/transaction.guard'
import type { TUser } from 'src/common/types/meta.type'
import type { PaymentsService } from './payments.service'

@ApiSecurity('access-token')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(TransactionGuard)
  @Get('/methods/balance')
  async getBalancePayment(@CurrentUser() user: TUser) {
    return await this.paymentsService.getPaymentMethodBalance(user)
  }

  @Get('/methods')
  getAllPayments() {
    return this.paymentsService.getAllPayments()
  }

  @Get('/categories')
  getPaymentCategoriers() {
    return this.paymentsService.getPaymentCategoriers()
  }
}
