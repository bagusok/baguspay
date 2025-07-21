import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [BalanceService, DatabaseService],
})
export class BalanceModule {}
