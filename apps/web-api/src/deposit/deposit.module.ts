import { Module } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { BalanceModule } from 'src/integrations/payment-gateway/balance/balance.module'
import { PaymentGatewayModule } from 'src/integrations/payment-gateway/payment-gateway.module'
import { QueueModule } from 'src/queue/queue.module'
import { DepositController } from './deposit.controller'
import { DepositRepository } from './deposit.repository'
import { DepositService } from './deposit.service'

@Module({
  imports: [PaymentGatewayModule, QueueModule, BalanceModule],
  exports: [DepositService],
  controllers: [DepositController],
  providers: [DepositService, DatabaseService, DepositRepository],
})
export class DepositModule {}
