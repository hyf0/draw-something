import { createIncreaseIdGetter } from '../util/helper';
import { TGlobalMaps } from '..';
import NodeWebsocket from 'ws';
import UserService from './UserService';
import { IControllerContext } from '../types';
import { RoomStatus, RoomType } from '../util/contants';
import SenderService from './SenderService';
import ChattingMessage from '../models/ChattingMessage';
import ResponseMessage from '../models/ResponseMessage';

const getNextRoomId = createIncreaseIdGetter(1);

export default class RoomService {
  public name: string;
  public type: RoomType;
  public id = getNextRoomId();
  public users = new Map<string, UserService>();
  public status: RoomStatus = RoomStatus.WAITING;
  public maxPlayerNumber = 8;
  public createAt = Date.now();
  public playTimes = 3;
  public gameTime = 6;
  private ws: NodeWebsocket;

  get numberOfCurrentPlayer() {
    return this.users.size;
  }

  get isFulled() {
    return this.users.size === this.maxPlayerNumber;
  }

  constructor(
    args: {
      ws: NodeWebsocket;
      name: string;
      type: RoomType;
    },
    private globalMaps: TGlobalMaps,
  ) {
    this.name = args.name;
    this.type = args.type;
    this.ws = args.ws;
  }

  toJSON() {
    // 重载对象的JSON.stringfy方法，防止暴露不必要，或私密的属性
    return {
      name: this.name,
      type: this.type,
      id: this.id,
      users: [...this.users.values()],
      status: this.status,
      maxPlayerNumber: this.maxPlayerNumber,
      createAt: this.createAt,
      playTimes: this.playTimes,
      gameTime: this.gameTime,
    };
  }

  getUserArray() {
    return [...this.users.values()];
  }

  addPlayerToRoom(player: UserService) {
    if (this.numberOfCurrentPlayer >= this.maxPlayerNumber) {
      throw new Error('房间人数已满');
    } else if (this.status === RoomStatus.GAMING) {
      throw new Error('房间正在游戏中');
    } else {
      if (!player.isLogined) throw new Error('此用户未登录');
      this.users.set(player.id, player);
      player.currentRoomId = this.id;
    }
    // const room
  }

  removePlayerInRoom(player: UserService) {
    if (this.status === RoomStatus.WAITING) {
      player.currentRoomId = null;
      this.users.delete(player.id);
      if (this.numberOfCurrentPlayer === 0) {
        this.globalMaps.roomMap.delete(this.id);
      }
    }
  }

  sendChattingMessageToUsers(chatMsg: ChattingMessage, roomId = this.id) {
    this.sendMessageToUsers(chatMsg, 'reciveChatMessage', roomId);
  }

  sendMessageToUsers(data: any, trigger: string, roomId = this.id, desc?: string) {
    const room = this.globalMaps.roomMap.get(roomId);
    if (room == null) return;
    const respMsg = new ResponseMessage(data, undefined, trigger, desc ? desc : 'sendMessageToUsers');
    for (let user of room.users.values()) {
      SenderService.send(user.ws, respMsg);
    }
  }

  sendMessageToUsersButUser(data: any, trigger: string | undefined, butUser: UserService, desc?: string) {
    const room = this.globalMaps.roomMap.get(this.id);
    if (room == null) return;
    for (let user of room.users.values()) {
      if (user.id !== butUser.id) {
        const respMsg = new ResponseMessage(data, undefined, trigger,  desc ? desc : 'sendMessageToUsers');
        SenderService.send(user.ws, respMsg);
      }
    }
  }
}
