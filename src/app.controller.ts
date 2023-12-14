import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@Controller()
export class AppController {
  private baseUrl: string;
  constructor(config: ConfigService) {
    this.baseUrl = config.get('BASE_URL');
  }

  @ApiTags('welcome')
  @Get()
  getWelcome() {
    return {
      success: true,
      message: 'Welcome to Portfolio API',
      data: {
        api: {
          endpoint: `${this.baseUrl}/api`,
          docs: `${this.baseUrl}/api/docs`,
        },
      },
    };
  }

  @ApiTags('welcome')
  @Get('/api')
  getWelcomeApi() {
    return {
      success: true,
      message: 'Welcome to Portfolio API',
      data: {
        endpoint: `${this.baseUrl}/api`,
        docs: `${this.baseUrl}/api/docs`,
      },
    };
  }
}
