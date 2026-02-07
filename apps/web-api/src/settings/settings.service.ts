import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'

import bcrypt from 'bcrypt'
import type { TUser } from 'src/common/types/meta.type'
import { SendResponse } from 'src/common/utils/response'
import { DatabaseService } from 'src/database/database.service'
import { UserRepository } from 'src/user/user.repository'
import { ChangeEmailDto } from './dtos/change-email.dto'
import { ChangePasswordDto } from './dtos/change-password.dto'
import { changePhoneNumberDto } from './dtos/change-phone.dto'
import { ChangeProfileDto } from './dtos/change-profile.dto'

@Injectable()
export class SettingsService {
  constructor(
    readonly _databaseService: DatabaseService,
    private readonly userRepository: UserRepository,
  ) {}

  async changePassword(data: ChangePasswordDto, _user: TUser) {
    const user = await this.userRepository.findUserById(_user.id)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const verifyOldPassword = await bcrypt.compare(data.old_password, user.password)

    if (!verifyOldPassword) {
      throw new BadRequestException('Old password is incorrect')
    }

    const hashedNewPassword = await bcrypt.hash(data.new_password, 10)

    //  compare hashed new password with old password to prevent same password
    const isSamePassword = await bcrypt.compare(data.new_password, user.password)
    if (isSamePassword) {
      throw new BadRequestException('New password cannot be the same as the old password')
    }

    await this.userRepository.updateUser({ password: hashedNewPassword }, _user.id)
    return SendResponse.success({
      message: 'Password changed successfully',
    })
  }

  async changeProfile(data: ChangeProfileDto, _user: TUser) {
    const user = await this.userRepository.findUserById(_user.id)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    await this.userRepository.updateUser({ name: data.name }, _user.id)
    return SendResponse.success({
      message: 'Profile updated successfully',
    })
  }

  async changePhoneNumber(data: changePhoneNumberDto, _user: TUser) {
    const user = await this.userRepository.findUserById(_user.id)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const existingPhone = await this.userRepository.findPhoneNumber(data.phone)

    if (existingPhone && existingPhone.id !== _user.id) {
      throw new BadRequestException('Phone number already in use')
    }

    await this.userRepository.updateUser({ phone: data.phone }, _user.id)
    return SendResponse.success({
      message: 'Phone number updated successfully',
    })
  }

  async changeEmail(data: ChangeEmailDto, _user: TUser) {
    const user = await this.userRepository.findUserById(_user.id)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const existingEmail = await this.userRepository.findEmail(data.email)
    if (existingEmail && existingEmail.id !== _user.id) {
      throw new BadRequestException('Email already in use')
    }

    await this.userRepository.updateUser({ email: data.email }, _user.id)
    return SendResponse.success({
      message: 'Email updated successfully',
    })
  }
}
