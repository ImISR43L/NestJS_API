// src/app.controller.ts
import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name); // This line was missing the declaration.
  constructor(private readonly appService: AppService) {}

  @Get('health')
  healthCheck(): string {
    return this.appService.healthCheck();
  }

  @Post('test')
  testPost(@Body() body: any) {
    this.logger.log('--- TEST ENDPOINT HIT ---');
    this.logger.log(body);
    return { message: 'POST test successful!', data: body };
  }
}
