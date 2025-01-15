import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class SQSService {
  private sqs: AWS.SQS;

  constructor() {
    this.sqs = new AWS.SQS({ region: process.env.region }); // Replace with your AWS region
  }

  /**
   * Send a message to an SQS queue
   * @param queueUrl The URL of the SQS queue
   * @param messageBody The message to send
   * @param messageAttributes Optional message attributes
   */
  async sendMessage(queueUrl: string, messageBody: string, messageAttributes?: AWS.SQS.MessageBodyAttributeMap): Promise<AWS.SQS.SendMessageResult> {
    const params: AWS.SQS.SendMessageRequest = {
      QueueUrl: queueUrl,
      MessageBody: messageBody,
      MessageAttributes: messageAttributes,
    };

    try {
      const result = await this.sqs.sendMessage(params).promise();
      console.log('Message sent to SQS:', result);
      return result;
    } catch (error) {
      console.error('Error sending message to SQS:', error);
      throw new Error('Could not send message to SQS');
    }
  }

  /**
   * Receive messages from an SQS queue
   * @param queueUrl The URL of the SQS queue
   * @param maxNumberOfMessages The maximum number of messages to retrieve (default: 1)
   */
  async receiveMessages(queueUrl: string, maxNumberOfMessages = 1): Promise<AWS.SQS.ReceiveMessageResult> {
    const params: AWS.SQS.ReceiveMessageRequest = {
      QueueUrl: queueUrl,
      MaxNumberOfMessages: maxNumberOfMessages,
      MessageAttributeNames: ['All'],
      WaitTimeSeconds: 10, // Long polling for 10 seconds
    };

    try {
      const result = await this.sqs.receiveMessage(params).promise();
      console.log('Messages received from SQS:', result);
      return result;
    } catch (error) {
      console.error('Error receiving messages from SQS:', error);
      throw new Error('Could not receive messages from SQS');
    }
  }

  /**
   * Delete a message from an SQS queue
   * @param queueUrl The URL of the SQS queue
   * @param receiptHandle The receipt handle of the message to delete
   */
  async deleteMessage(queueUrl: string, receiptHandle: string): Promise<void> {
    const params: AWS.SQS.DeleteMessageRequest = {
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    };

    try {
      await this.sqs.deleteMessage(params).promise();
      console.log('Message deleted from SQS:', receiptHandle);
    } catch (error) {
      console.error('Error deleting message from SQS:', error);
      throw new Error('Could not delete message from SQS');
    }
  }

  /**
   * Purge all messages from an SQS queue
   * @param queueUrl The URL of the SQS queue
   */
  async purgeQueue(queueUrl: string): Promise<void> {
    const params: AWS.SQS.PurgeQueueRequest = {
      QueueUrl: queueUrl,
    };

    try {
      await this.sqs.purgeQueue(params).promise();
      console.log('SQS queue purged:', queueUrl);
    } catch (error) {
      console.error('Error purging SQS queue:', error);
      throw new Error('Could not purge SQS queue');
    }
  }
}
