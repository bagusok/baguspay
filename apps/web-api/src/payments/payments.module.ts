import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  exports: [PaymentsService],
  controllers: [PaymentsController],
  providers: [PaymentsService, DatabaseService],
})
export class PaymentsModule {}
