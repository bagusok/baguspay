import { Module } from '@nestjs/common'
import { AtlanticController } from './atlantic.controller'
import { AtlanticService } from './atlantic.service'

@Module({
  controllers: [AtlanticController],
  providers: [AtlanticService],
})
export class AtlanticModule {}
