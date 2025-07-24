import { Module } from '@nestjs/common';
import { AtlanticService } from './atlantic.service';
import { AtlanticController } from './atlantic.controller';

@Module({
  controllers: [AtlanticController],
  providers: [AtlanticService],
})
export class AtlanticModule {}
