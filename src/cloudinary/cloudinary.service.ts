import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';
import { createReadStream } from 'streamifier';
import { CloudinaryResponse } from './cloudinary.dto';

@Injectable()
export class CloudinaryService {
  async uploadImage(publicId: string, file: Express.Multer.File) {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      if (!file) {
        reject(
          new BadRequestException({
            success: false,
            message: 'File required!',
            data: null,
          }),
        );
      }

      const uploadStream = v2.uploader.upload_stream(
        {
          folder: 'portfolio',
          invalidate: true,
          public_id: publicId,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string) {
    return await v2.uploader.destroy(`portfolio/${publicId}`, {
      invalidate: true,
      resource_type: 'image',
    });
  }
}
