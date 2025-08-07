import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
