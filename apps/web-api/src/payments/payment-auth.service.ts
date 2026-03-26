import { BadRequestException, Injectable } from '@nestjs/common'
import { type PasskeyAssertion, PaymentAuthType } from './payment-auth.type'
import { PinService } from './pin.service'

interface VerifyBalanceAuthParams {
  userId: string
  authType?: PaymentAuthType
  pin?: string
  passkeyAssertion?: PasskeyAssertion
}

@Injectable()
export class PaymentAuthService {
  constructor(private readonly pinService: PinService) {}

  getSupportedMethods(): PaymentAuthType[] {
    return [PaymentAuthType.PIN, PaymentAuthType.PASSKEY]
  }

  async verifyBalanceAuth(params: VerifyBalanceAuthParams) {
    const authType = params.authType || PaymentAuthType.PIN

    switch (authType) {
      case PaymentAuthType.PIN: {
        if (!params.pin) {
          throw new BadRequestException('PIN is required for balance payments.')
        }
        await this.pinService.verifyPin(params.userId, params.pin)
        return
      }
      case PaymentAuthType.PASSKEY: {
        // Placeholder for future WebAuthn assertion verification
        // Once implemented, verify params.passkeyAssertion against stored credentials
        throw new BadRequestException('Passkey verification is not available yet.')
      }
      default:
        throw new BadRequestException('Unsupported payment authentication method.')
    }
  }
}
