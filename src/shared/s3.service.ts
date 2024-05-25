import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/clients/s3';

@Injectable()
export class S3Service {
  private readonly s3: AWS.S3;

  constructor(private configService: ConfigService) {
    AWS.config.update({
      accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: configService.get<string>('AWS_S3_REGION'),
    });

    this.s3 = new AWS.S3();
  }

  async uploadFileToS3(
    file: Express.Multer.File,
    key: string,
  ): Promise<string> {
    try {
      const params: AWS.S3.Types.PutObjectRequest = {
        Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
        Key: key,
        Body: file.buffer,
      };

      const uploadResult: ManagedUpload.SendData = await this.s3
        .upload(params)
        .promise();

      return uploadResult.Location;
    } catch (error) {
      console.log(error);
      throw new HttpException(error, 500);
    }
  }
}
