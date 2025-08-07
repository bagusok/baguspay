import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/common/decorators/user.decorator';
import { TUser } from 'src/common/types/meta.type';
import { RedeemVoucherDto } from './offers.dto';
import { OffersService } from './offers.service';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('redeem-voucher')
  async redeemVoucher(@Body() data: RedeemVoucherDto, @User() user: TUser) {
    return this.offersService.redeemVoucher(data, user);
  }
}
