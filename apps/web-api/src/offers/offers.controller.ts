import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { TransactionGuard } from 'src/auth/guards/transaction.guard'
import { User } from 'src/common/decorators/user.decorator'
import type { TUser } from 'src/common/types/meta.type'
import { RedeemVoucherDto } from './offers.dto'
import { OffersService } from './offers.service'

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @UseGuards(TransactionGuard)
  @Post('redeem-voucher')
  async redeemVoucher(@Body() data: RedeemVoucherDto, @User() user: TUser) {
    return await this.offersService.redeemVoucher(data, user)
  }
}
