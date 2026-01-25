import { Module } from '@nestjs/common'
import { DatabaseModule } from 'src/database/database.module'
import { UserModule } from 'src/user/user.module'
import { SettingsController } from './settings.controller'
import { SettingsService } from './settings.service'

@Module({
  imports: [DatabaseModule, UserModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
