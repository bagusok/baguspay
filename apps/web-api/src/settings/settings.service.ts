import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'

import { eq } from '@repo/db'
import { tb } from '@repo/db/types'
import bcrypt from 'bcrypt'
import { TUser } from 'src/common/types/meta.type'
import { SendResponse } from 'src/common/utils/response'
import { DatabaseService } from 'src/database/database.service'
import { ChangePasswordDto } from './dtos/change-password.dto'

@Injectable()
export class SettingsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async changePassword(data: ChangePasswordDto, _user: TUser) {
    const user = await this.databaseService.db.query.users.findFirst({
      where: eq(tb.users.id, _user.id),
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const verifyOldPassword = await bcrypt.compare(data.old_password, user.password)

    if (!verifyOldPassword) {
      throw new BadRequestException('Old password is incorrect')
    }

    const hashedNewPassword = await bcrypt.hash(data.new_password, 10)

    await this.databaseService.db
      .update(tb.users)
      .set({ password: hashedNewPassword })
      .where(eq(tb.users.id, _user.id))
      .execute()

    return SendResponse.success({
      message: 'Password changed successfully',
    })
  }
}
