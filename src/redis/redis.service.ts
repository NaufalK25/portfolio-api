import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService extends Redis {
  constructor(config: ConfigService) {
    super({
      url: config.get('KV_REST_API_URL'),
      token: config.get('KV_REST_API_TOKEN'),
    });
  }
}
