import { Module } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { PaymentAuthService } from './payment-auth.service'
import { PaymentsController } from './payments.controller'
import { PaymentsRepository } from './payments.repository'
import { PaymentsService } from './payments.service'
import { PinService } from './pin.service'

@Module({
  exports: [PaymentsService, PinService, PaymentAuthService],
  controllers: [PaymentsController],
  providers: [PaymentsService, DatabaseService, PaymentsRepository, PinService, PaymentAuthService],
})
export class PaymentsModule {}
