import {
  Body,
  Controller,
  Headers,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DigiflazzCallbackData } from 'src/integrations/h2h/digiflazz/digiflazz.service';
import { TripayCallbackData } from 'src/integrations/payment-gateway/tripay/tripay.type';
import { CallbackService } from './callback.service';

@Controller('callback')
export class CallbackController {
  constructor(private readonly callbackService: CallbackService) {}

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
}
