import { BadRequestException, Injectable } from '@nestjs/common'
import { eq } from '@repo/db'
import { tb } from '@repo/db/types'
import { compare, hash } from 'bcrypt'
import { DatabaseService } from 'src/database/database.service'

const PIN_LENGTH = 6
const PIN_MAX_ATTEMPTS = 3
const PIN_LOCK_MINUTES = 30

@Injectable()
export class PinService {
  constructor(private readonly databaseService: DatabaseService) {}

  get maxAttempts() {
    return PIN_MAX_ATTEMPTS
  }

  get lockMinutes() {
    return PIN_LOCK_MINUTES
  }

  async setPin(userId: string, pin: string) {
    this.assertPinFormat(pin)
    const hashedPin = await hash(pin, 10)

    await this.databaseService.db
      .update(tb.users)
      .set({
        pin_hash: hashedPin,
        pin_attempts: 0,
        pin_locked_until: null,
        pin_set_at: new Date(),
      })
      .where(eq(tb.users.id, userId))
  }

  async verifyPin(userId: string, pin: string) {
    this.assertPinFormat(pin)

    const user = await this.databaseService.db.query.users.findFirst({
      where: eq(tb.users.id, userId),
      columns: {
        id: true,
        pin_hash: true,
        pin_attempts: true,
        pin_locked_until: true,
      },
    })

    if (!user || !user.pin_hash) {
      throw new BadRequestException('PIN is not set for this account.')
    }

    if (user.pin_locked_until && user.pin_locked_until > new Date()) {
      throw new BadRequestException('PIN is locked. Please try again later or reset your PIN.')
    }

    const isValid = await compare(pin, user.pin_hash)
    if (!isValid) {
      await this.handleFailedAttempt(userId, user.pin_attempts ?? 0)
      throw new BadRequestException('Invalid PIN.')
    }

    await this.databaseService.db
      .update(tb.users)
      .set({
        pin_attempts: 0,
        pin_locked_until: null,
      })
      .where(eq(tb.users.id, userId))
  }

  async changePin(userId: string, currentPin: string, newPin: string) {
    if (currentPin === newPin) {
      throw new BadRequestException('New PIN must be different from current PIN.')
    }

    await this.verifyPin(userId, currentPin)
    await this.setPin(userId, newPin)
  }

  private async handleFailedAttempt(userId: string, currentAttempts: number) {
    const attempts = currentAttempts + 1
    const shouldLock = attempts >= PIN_MAX_ATTEMPTS
    await this.databaseService.db
      .update(tb.users)
      .set({
        pin_attempts: shouldLock ? 0 : attempts,
        pin_locked_until: shouldLock ? new Date(Date.now() + PIN_LOCK_MINUTES * 60 * 1000) : null,
      })
      .where(eq(tb.users.id, userId))
  }

  private assertPinFormat(pin: string) {
    if (!pin || pin.length !== PIN_LENGTH || !/^[0-9]+$/.test(pin)) {
      throw new BadRequestException(`PIN must be a ${PIN_LENGTH}-digit number.`)
    }
  }
}
