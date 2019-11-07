import NodeWebsocket from 'ws';
import ResponseMessage from '../models/ResponseMessage';
import { IS_DEV } from '../util/contants';

export default class SenderService {
  static __send(ws: NodeWebsocket, data: any) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
    } else {
      console.error('ws is not open', ws.readyState);
    }
  }

  static send(ws: NodeWebsocket, msg: ResponseMessage) {
    if (IS_DEV) {
      console.log(`send back ${msg.trigger}-${msg.requestId}`, JSON.stringify(msg, null, 2));
    }
    this.sendResponseMessage(ws, msg);
  }

  static sendResponseMessage(ws: NodeWebsocket, msg: ResponseMessage) {
    this.__send(ws, msg);
  }

  static sendError(
    ws: NodeWebsocket,
    msg: ResponseMessage,
    error: {
      title: string;
      detail?: string;
    },
  ) {
    msg.error = error;
    this.send(ws, msg);
  }

  constructor(public ws: NodeWebsocket) {}

  // send(data: any) {
  //   const { ws } = this;
  //   if (ws.readyState === ws.OPEN) {
  //     ws.send(JSON.stringify(data));
  //   } else {
  //     console.error('ws is not open', ws.readyState);
  //   }
  // }

  // sendMessage(msg: IMessage) {
  //   this.send(msg);
  // }

  // sendErrorMessage(msg: IMessage) {
  //   msg.error = true;
  //   this.send(msg);
  // }
}
