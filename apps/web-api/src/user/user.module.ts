import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [UserService, DatabaseService],
  controllers: [UserController],
})
export class UserModule {}
