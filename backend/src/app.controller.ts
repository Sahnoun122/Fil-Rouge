import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'OK',
      message: 'MarketPlan IA API est en ligne',
      timestamp: new Date().toISOString(),
      database: 'MongoDB connecté'
    };
  }
}
