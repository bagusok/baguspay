import { Module } from '@nestjs/common'
import { DatabaseModule } from 'src/database/database.module'
import { OffersController } from './offers.controller'
import { OffersRepository } from './offers.repository'
import { OffersService } from './offers.service'

@Module({
  exports: [OffersRepository, OffersService],
  imports: [DatabaseModule],
  controllers: [OffersController],
  providers: [OffersService, OffersRepository],
})
export class OffersModule {}
