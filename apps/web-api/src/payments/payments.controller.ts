import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiSecurity } from '@nestjs/swagger'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import { TransactionGuard } from 'src/auth/guards/transaction.guard'
import type { TUser } from 'src/common/types/meta.type'
import { ChangePinDto, ResetPinDto, SetPinDto } from './dto/pin.dto'
import { PaymentsService } from './payments.service'

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

  @UseGuards(TransactionGuard)
  @Post('/pin/set')
  async setPin(@CurrentUser() user: TUser, @Body() payload: SetPinDto) {
    return this.paymentsService.setPin(user, payload)
  }

  @UseGuards(TransactionGuard)
  @Post('/pin/change')
  async changePin(@CurrentUser() user: TUser, @Body() payload: ChangePinDto) {
    return this.paymentsService.changePin(user, payload)
  }

  @UseGuards(TransactionGuard)
  @Post('/pin/reset')
  async resetPin(@CurrentUser() user: TUser, @Body() payload: ResetPinDto) {
    return this.paymentsService.resetPin(user, payload)
  }
}
