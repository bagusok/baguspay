import { Module } from '@nestjs/common';
import { DigiflazzService } from './digiflazz.service';

@Module({
  providers: [DigiflazzService],
  exports: [DigiflazzService],
})
export class DigiflazzModule {}
