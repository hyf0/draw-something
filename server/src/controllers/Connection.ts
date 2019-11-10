import NodeWebsocket from 'ws';

import { TGlobals } from '../globals';
import { parseRawMessage } from '../middleware/parseMessage';
import { IS_DEV } from '../util/contants';
import handlers from '../handlers';
import RequestMessage from '../models/RequestMessage';
import HandlerContext from '../models/HandlerContext';
import UserService from '../services/UserService';
import User from '../services/User';
import { log, logError } from '../util/helper';


export default class Connection {
  user: User | undefined;
  constructor(private ws: NodeWebsocket, private globals: TGlobals) {
    this.bindEvents(ws);
  }

  bindEvents(ws: NodeWebsocket) {
    ws.on('message', this.handlerMessage.bind(this));
    ws.on('error', err => {
      console.error('ws error', err);
    });
  }

  handlerMessage(rawMessage: NodeWebsocket.Data) {
    const reqMsg = parseRawMessage(rawMessage);
    if (IS_DEV) {
      log(`reqeust ${reqMsg.handler}-${reqMsg.id}`, JSON.stringify(reqMsg.data, null, 2));
    }

    if (reqMsg.handler != undefined) {
      const hasHandler = reqMsg.handler in handlers;
      if (!hasHandler) logError(`请求了不存在的handler ${reqMsg.handler}`);
      else {
        const handler = handlers[reqMsg.handler];
        handler(this.buildContext(reqMsg, this.globals));
      }
    } else {
      logError('未注明请求的handler', JSON.stringify(reqMsg, null, 2));
    }
  }

  private buildContext(reqMsg: RequestMessage, globals: TGlobals): HandlerContext {

    return new HandlerContext({
      user: this.user,
      requestMessage: reqMsg,
      ws: this.ws,
      globals,
      connection: this,
    })
  }

}
