import { Body, Controller, Headers, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { DuitkuCallbackPayload } from 'src/integrations/payment-gateway/duitku/duitku.type'
import type { TripayCallbackData } from 'src/integrations/payment-gateway/tripay/tripay.type'
import type { PaymentGatewayCallbackService } from './payment-gateway-callback.service'

@ApiTags('Callback')
@Controller('callback/payment')
export class PaymentGatewayCallbackController {
  constructor(private readonly callbackService: PaymentGatewayCallbackService) {}

  @Post('tripay')
  tripay(@Body() body: TripayCallbackData, @Headers('X-Callback-Signature') signature: string) {
    return this.callbackService.handleTripay(body, signature)
  }
  @Post('duitku')
  duitku(@Body() body: DuitkuCallbackPayload) {
    return this.callbackService.handleDuitku(body)
  }
}
