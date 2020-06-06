import NodeWebsocket from 'ws';

import { TGlobals } from '../globals';
import RequestMessage from '../../../client/src/types/models/RequestMessage';
import ResponseMessage from '../../../client/src/types/models/ResponseMessage';
import SenderService from '../services/SenderService';
import User from '../services/User';
import Connection from '../controllers/Connection';
import Room from '../services/Room';
import Game from '../services/Game';

export default class HandlerContext {
  public user =  this.options.user;
  public globals = this.options.globals;
  public requestMessage = this.options.requestMessage;
  public connection = this.options.connection;
  public req = this.requestMessage;
  public room: Room | undefined;
  public game: Game | undefined;
  public ws = this.options.ws;
  constructor(
    private options: {
      requestMessage: RequestMessage;
      user: User| undefined;
      globals: TGlobals;
      ws: NodeWebsocket;
      connection: Connection;
    },
  ) {
    const { user, globals } = options;
    if (user != undefined && user.currentRoomId != undefined) {
      this.room = globals.roomMap.get(user.currentRoomId);
      this.game = globals.gameMap.get(user.currentRoomId);
    }
  }

  sendRespData(data: unknown) {
    const respMsg = new ResponseMessage({
      data,
      requestId: this.req.id,
    });
    SenderService.send(this.ws, respMsg);
  }

  sendRespError(errTitle: string, errDetail?: string) {
    const respMsg = new ResponseMessage({
      data: undefined,
      requestId: this.req.id,
    });
    SenderService.sendError(this.ws, respMsg, {
      title: errTitle,
      detail: errDetail,
    });
  }
}
