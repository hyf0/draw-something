import NodeWebsocket from 'ws';

import { TGlobalMaps } from '../index';
import { IControllerContext, IMessage } from '../types';


import dispatcher from './dispatcher';
import UserService from '../services/UserService';
import SenderService from '../services/SenderService';
import { parseRawMessage } from '../middleware/parseMessage';
import RoomService from '../services/RoomService';
import GameService from '../services/GameService';
import RequestMessage from '../models/RequestMessage';
import ResponseMessage from '../models/ResponseMessage';
import { IS_DEV } from '../util/contants';

export default class ConnectionController {
  user: UserService;
  constructor(public ws: NodeWebsocket, private globalMaps: TGlobalMaps) {
    this.bindEvents();
    this.user = new UserService(ws, globalMaps);
  }

  private messageHandler(rawMsg: NodeWebsocket.Data) {
      const msg = parseRawMessage(rawMsg);
      if (IS_DEV) {
        console.log(`reqeust ${msg.handler}-${msg.id}`, JSON.stringify(msg.data, null, 2));
      }
      if (msg.handler != null) {
        const isHandlerRegisted = msg.handler in dispatcher;
        if (!isHandlerRegisted) throw new Error(`请求了不存在的handler ${msg.handler}`);
        const handler = dispatcher[msg.handler];
        handler(this.buildContext(msg, this.globalMaps));
      } else {
        console.log('不存在handler的请求', msg);
      }

  }

  private bindEvents() {
    this.ws.on('message', this.messageHandler.bind(this));
    this.ws.on('error', err => {
      console.error('ws error', err);
    });
  }

  private buildContext(reqMsg: RequestMessage, globalMaps: TGlobalMaps): IControllerContext {
    const connection = this;
    this.user.lastActiveTime = Date.now();
    let room: RoomService | null = null;
    let game: GameService | null = null;
    if (this.user.currentRoomId != null) {
      const r = globalMaps.roomMap.get(this.user.currentRoomId);
      const g = globalMaps.gameMap.get(this.user.currentRoomId);
      room = r ? r : null;
      game = g ? g : null;
    }
    const defaultContext: IControllerContext = {
      message: reqMsg,
      user: this.user,
      ws: this.ws,
      room,
      game,
      sendRespData(data: any) {
        // 这个 send data 仅仅针对的是本次请求
        const respMsg = new ResponseMessage(data, reqMsg.id);
        SenderService.send(connection.ws, respMsg);
      },
      sendRespError(title: string, detail?: string) {
        // 这个 send data 仅仅针对的是本次请求
        const respMsg = new ResponseMessage(undefined, reqMsg.id);
        SenderService.sendError(connection.ws, respMsg, {
          title,
          detail,
        });
      },
      globalMaps,
    };
    return defaultContext;
  }
}
