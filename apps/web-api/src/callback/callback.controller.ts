import { Body, Controller, Headers, Post } from '@nestjs/common';
import { CallbackService } from './callback.service';
import { TripayCallbackData } from 'src/integrations/payment-gateway/tripay/tripay.type';

@Controller('callback')
export class CallbackController {
  constructor(private readonly callbackService: CallbackService) {}

  @Post('tripay')
  async handleTripayCallback(
    @Body() data: TripayCallbackData,
    @Headers('X-Callback-Signature') callbackSignature,
  ): Promise<void> {
    return this.callbackService.handleTripayCallback(data, callbackSignature);
  }
}
