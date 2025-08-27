import { Module } from '@nestjs/common';
import { DuitkuAPiService } from './duitku.api.service';
import { DuitkuService } from './duitku.service';

@Module({
  providers: [DuitkuService, DuitkuAPiService],
  exports: [DuitkuService, DuitkuAPiService],
})
export class DuitkuModule {}
