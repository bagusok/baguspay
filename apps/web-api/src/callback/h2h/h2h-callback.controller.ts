import { Body, Controller, Headers, Ip, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  DigiflazzPostpaidCallbackData,
  DigiflazzPrepaidCallbackData,
} from 'src/integrations/h2h/digiflazz/digiflazz.type'
import { H2HCallbackService } from './h2h-callback.service'

@ApiTags('Callback')
@Controller('callback/h2h')
export class H2HCallbackController {
  constructor(private readonly callbackService: H2HCallbackService) {}

  @Post('digiflazz')
  digiflazz(
    @Body() body: DigiflazzPrepaidCallbackData | DigiflazzPostpaidCallbackData,
    @Headers('X-Digiflazz-Event') event: 'create' | 'update',
    @Headers('X-Hub-Signature') signFromPost: string,
    @Headers('User-Agent') userAgent: 'Digiflazz-Hookshot' | 'Digiflazz-Pasca-Hookshot',
    @Ip() ip: string,
  ) {
    // console.log('Digiflazz Callback Body:', ip)

    // if (DIGIFLAZZ_IPS.includes(ip) === false) {
    //   throw new BadRequestException('Invalid IP Address')
    // }

    return this.callbackService.handleDigiflazz(body, signFromPost, event, userAgent)
  }
}
