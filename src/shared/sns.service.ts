import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class SNSService {
  private sns: AWS.SNS;

  constructor() {
    this.sns = new AWS.SNS({ region: process.env.region });
  }

  async subscribeToTopic(
    topicArn: string,
    protocol: string,
    endpoint: string,
    userEmail: string,
  ) {
    const params = {
      Protocol: protocol, // 'email' or 'sms'
      Endpoint: endpoint, // The user's email or phone number
      TopicArn: topicArn,
      Attributes: {
        filter: JSON.stringify({
          userEmail: userEmail, // Filter by userEmail
        }),
      },
    };

    try {
      const result = await this.sns.subscribe(params).promise();
      console.log(`User subscribed with filter: ${endpoint}`);
      return result;
    } catch (error) {
      console.error('Error subscribing user:', error);
      throw new Error('Could not subscribe user');
    }
  }

  // Publish message to SNS topic (for sending notifications)
  async publishToSNS(
    topicArn: string,
    message: string,
    userEmail: string,
    userPhone: string,
    orderId: string,
  ) {
    const params = {
      Message: message,
      TopicArn: topicArn,
      MessageAttributes: {
        userEmail: {
          DataType: 'String',
          StringValue: userEmail, // Only the user's email who placed the order
        },
        userPhone: {
          DataType: 'String',
          StringValue: userPhone,
        },
        orderId: {
          DataType: 'String',
          StringValue: orderId,
        },
      },
    };

    try {
      const result = await this.sns.publish(params).promise();
      console.log('Message sent to SNS:', result);
      return result;
    } catch (error) {
      console.error('Error sending message to SNS:', error);
      throw new Error('Could not send message to SNS');
    }
  }
}

//usage

/*
await this.snsService.subscribeToTopicWithFilter(
      topicArn,
      'email',  // Protocol
      orderDetails.userEmail,  // User's email address
      orderDetails.userEmail,  // Filter: send to this email
    );

    // Subscribe the user's phone number for SMS (no filter needed)
    await this.snsService.subscribeToTopicWithFilter(
      topicArn,
      'sms',  // Protocol
      orderDetails.userPhoneNumber,  // User's phone number
      orderDetails.userEmail,  // Filter is optional for SMS
    );

    // Step 3: Publish a message to SNS topic
    const message = `Order placed successfully! Order ID: ${orderDetails.orderId}`;
    await this.snsService.publishToSNS(
      topicArn,
      message,
      orderDetails.userEmail,
      orderDetails.userPhoneNumber,
      orderDetails.orderId,
    );
*/
