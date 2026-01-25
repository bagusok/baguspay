import { Module } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { UserController } from './user.controller'
import { UserRepository } from './user.repository'
import { UserService } from './user.service'

@Module({
  exports: [UserRepository],
  providers: [UserService, DatabaseService, UserRepository],
  controllers: [UserController],
})
export class UserModule {}
