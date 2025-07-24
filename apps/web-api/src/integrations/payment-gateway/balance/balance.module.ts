import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { BalanceService } from './balance.service';

@Module({
  imports: [DatabaseModule],
  providers: [BalanceService],
  exports: [BalanceService],
})
export class BalanceModule {}
