import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { Cloudinary } from './cloudinary';

@Module({
  exports: [CloudinaryService, Cloudinary],
  providers: [CloudinaryService, Cloudinary],
})
export class CloudinaryModule {}
