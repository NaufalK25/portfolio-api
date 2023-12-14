import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 } from 'cloudinary';

@Injectable()
export class Cloudinary {
  constructor(private config: ConfigService) {}

  public provide = 'Cloudinary';

  useFactory() {
    return v2.config({
      cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get('CLOUDINARY_API_KEY'),
      api_secret: this.config.get('CLOUDINARY_API_SECRET'),
    });
  }
}
