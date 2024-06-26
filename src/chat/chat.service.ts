import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Socket;

  @SubscribeMessage('message')
  //   handleMessage(client, payload) {
  //     console.log({ client, payload });
  //     return payload;
  //   }
  handleMessage(@MessageBody() body: any, @ConnectedSocket() socket: Socket) {
    console.log(' chat ---->', { body, address: socket.id });

    this.server.emit('message', 'Hello from server');
    // return body;
  }
}
