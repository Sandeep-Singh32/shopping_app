import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class EmailService {
  private ses: AWS.SES;

  constructor() {
    this.ses = new AWS.SES({
      region: 'us-east-1',  // SES region
      accessKeyId: '<AWS_ACCESS_KEY_ID>',
      secretAccessKey: '<AWS_SECRET_ACCESS_KEY>',
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    const params = {
      Source: process.env.src,  // SES verified sender email
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
        },
        Body: {
          Text: {
            Data: text,
          },
        },
      },
    };

    try {
      await this.ses.sendEmail(params).promise();
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
