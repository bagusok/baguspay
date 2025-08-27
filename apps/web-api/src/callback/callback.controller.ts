import {
  Body,
  Controller,
  Headers,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DigiflazzCallbackData } from 'src/integrations/h2h/digiflazz/digiflazz.service';
import { DuitkuCallbackPayload } from 'src/integrations/payment-gateway/duitku/duitku.type';
import { TripayCallbackData } from 'src/integrations/payment-gateway/tripay/tripay.type';
import { CallbackService } from './callback.service';
import { DepositCallbackService } from './deposit.callback.service';
import { PaymentCallbackService } from './payment.callback.service';

@Controller('callback')
export class CallbackController {
  constructor(
    private readonly callbackService: CallbackService,
    private readonly depositCallbackService: DepositCallbackService,
    private readonly paymentCallbackService: PaymentCallbackService,
  ) {}

  @Post('tripay')
  async handleTripayCallback(
    @Body() data: TripayCallbackData,
    @Headers('X-Callback-Signature') callbackSignature,
  ) {
    return this.callbackService.handleTripayCallback(data, callbackSignature);
  }

  @Post('digiflazz')
  async handleDigiflazz(
    @Body() data: { data: DigiflazzCallbackData },
    @Headers('X-Hub-Signature') callbackSignature,
    @Headers('X-Digiflazz-Event') event: 'create' | 'update',
    @Headers('User-Agent') userAgent: string,
  ) {
    if (userAgent.startsWith('Digiflazz-Hookshot')) {
      return this.callbackService.handleDigiflazzPrepaidCallback(
        data,
        callbackSignature,
        event,
      );
    } else {
      throw new UnprocessableEntityException(
        'Invalid User-Agent. Only Digiflazz-Hookshot is allowed.',
      );
    }
  }

  @Post('duitku')
  async handleSuitkuCallback(@Body() data: DuitkuCallbackPayload) {
    console.log('Callback Duitku Masuk:', data);
    if (data.merchantOrderId.startsWith('DEPO')) {
      return this.depositCallbackService.duitkuCallback(data);
    } else {
      return this.paymentCallbackService.duitkuCallback(data);
    }
  }
}
