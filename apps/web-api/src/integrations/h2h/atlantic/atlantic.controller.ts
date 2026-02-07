import { Controller } from '@nestjs/common'
import { AtlanticService } from './atlantic.service'

@Controller('atlantic')
export class AtlanticController {
  constructor(readonly _atlanticService: AtlanticService) {}
}
