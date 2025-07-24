import { Module } from '@nestjs/common';
import { TripayService } from './tripay.service';

@Module({
  providers: [TripayService],
  exports: [TripayService],
})
export class TripayModule {}
