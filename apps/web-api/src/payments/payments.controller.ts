import { Controller, Get } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiSecurity } from '@nestjs/swagger';

@ApiSecurity('access-token')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('/methods')
  getAllPayments() {
    return this.paymentsService.getAllPayments();
  }

  @Get('/categories')
  getPaymentCategoriers() {
    return this.paymentsService.getPaymentCategoriers();
  }
}
