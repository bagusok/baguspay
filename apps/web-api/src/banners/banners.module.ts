import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';

@Module({
  imports: [DatabaseModule],
  controllers: [BannersController],
  providers: [BannersService],
})
export class BannersModule {}
