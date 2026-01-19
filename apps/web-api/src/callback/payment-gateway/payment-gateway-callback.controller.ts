import { Body, Controller, Headers, Post } from '@nestjs/common'
import { DuitkuCallbackPayload } from 'src/integrations/payment-gateway/duitku/duitku.type'
import { TripayCallbackData } from 'src/integrations/payment-gateway/tripay/tripay.type'
import { PaymentGatewayCallbackService } from './payment-gateway-callback.service'

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
