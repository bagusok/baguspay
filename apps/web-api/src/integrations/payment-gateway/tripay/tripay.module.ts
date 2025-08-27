import { Module } from '@nestjs/common';
import { TripayApiService } from './tripay.api.service';
import { TripayService } from './tripay.service';

@Module({
  providers: [TripayService, TripayApiService],
  exports: [TripayService, TripayApiService],
})
export class TripayModule {}
