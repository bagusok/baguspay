import { Controller, Get, Post } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Post()
  postHello(): string {
    // console.log('Received body:', body)
    return 'Hello from POST request!'
  }
}
