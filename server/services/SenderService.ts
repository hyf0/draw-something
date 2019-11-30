import NodeWebsocket from 'ws';

import ResponseMessage from '../../shared/models/ResponseMessage';
import { IS_DEV_SERVER } from '../util/contants';
import { logError, log } from '../util/helper';

export default class SenderService {
  static __send(ws: NodeWebsocket, data: any) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
    } else {
      logError('ws is not open', ws.readyState);
    }
  }

  static send(ws: NodeWebsocket, msg: ResponseMessage) {
    if (IS_DEV_SERVER) {
      log(
        `sendBack ${msg.trigger ? `${msg.trigger}-` : ''}${
          msg.requestId ? msg.requestId : ''
        }`,
        JSON.stringify(msg, null, 2),
      );
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
