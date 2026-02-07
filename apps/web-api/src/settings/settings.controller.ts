import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard'
import type { TUser } from 'src/common/types/meta.type'
import { ChangeEmailDto } from './dtos/change-email.dto'
import { ChangePasswordDto } from './dtos/change-password.dto'
import { changePhoneNumberDto } from './dtos/change-phone.dto'
import { ChangeProfileDto } from './dtos/change-profile.dto'
import { SettingsService } from './settings.service'

@ApiTags('User')
@UseGuards(JwtAuthGuard)
@Controller('user/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post('change-password')
  async changePassword(@Body() body: ChangePasswordDto, @CurrentUser() _user: TUser) {
    return this.settingsService.changePassword(body, _user)
  }

  @Post('change-profile')
  async changeProfile(@Body() body: ChangeProfileDto, @CurrentUser() _user: TUser) {
    return this.settingsService.changeProfile(body, _user)
  }

  @Post('change-phone-number')
  async changePhoneNumber(@Body() body: changePhoneNumberDto, @CurrentUser() _user: TUser) {
    return this.settingsService.changePhoneNumber(body, _user)
  }

  @Post('change-email')
  async changeEmail(@Body() body: ChangeEmailDto, @CurrentUser() _user: TUser) {
    return this.settingsService.changeEmail(body, _user)
  }
}
