import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ChatGateway],
  exports: [],
})
export class ChatModule {}
