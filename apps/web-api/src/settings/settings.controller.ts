import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import { TUser } from 'src/common/types/meta.type'
import { ChangePasswordDto } from './dtos/change-password.dto'
import { SettingsService } from './settings.service'

@ApiTags('User')
@Controller('user/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post('change-password')
  async changePassword(@Body() body: ChangePasswordDto, @CurrentUser() _user: TUser) {
    return this.settingsService.changePassword(body, _user)
  }
}
