import { RoomStatus, RoomType } from '../../shared/constants/room';
import ChattingMessage from '../../shared/models/ChattingMessage';
import ResponseMessage from '../../shared/models/ResponseMessage';
import { IRoom } from '../../shared/types';
import { TGlobals } from '../globals';
import { createIncreaseIdGetter } from '../util/helper';
import SenderService from './SenderService';
import User from './User';


const getNextRoomId = createIncreaseIdGetter(1);

export default class Room {
  public name: string;
  public type: RoomType;
  public id = getNextRoomId();
  public userIdSet = new Set<string>(); // 存储user id
  public status: RoomStatus = RoomStatus.WAITING;
  public maxPlayerNumber = 8;
  public createAt = Date.now();
  public playTimes = 3;
  public gameTime = 6;

  get users() {
    const userIds = [...this.userIdSet.keys()];
    const users = userIds.map(uid => {
      const user = this.globals.userMap.get(uid);
      if (user == undefined)
        throw new Error(`users 错误，未找到 ${uid} 对应的用户`);
      return user;
    });
    return users;
  }

  get userNumber() {
    return this.userIdSet.size;
  }

  get isFulled() {
    return this.userNumber === this.maxPlayerNumber;
  }

  constructor(
    args: {
      name: string;
      type: RoomType;
    },
    private globals: TGlobals,
  ) {
    this.name = args.name;
    this.type = args.type;

    globals.roomMap.set(this.id, this);
  }

  toJSON(): IRoom {
    // 重载对象的JSON.stringfy方法，防止暴露不必要，或私密的属性
    return {
      name: this.name,
      type: this.type,
      id: this.id,
      users: this.users.map(u => u.toJSON()),
      status: this.status,
      maxPlayerNumber: this.maxPlayerNumber,
      createAt: this.createAt,
      playTimes: this.playTimes,
      gameTime: this.gameTime,
    };
  }

  addPlayerToRoom(user: User) {
    if (this.isFulled) {
      throw new Error('房间人数已满');
    } else if (this.status === RoomStatus.GAMING) {
      throw new Error('房间正在游戏中');
    } else {
      this.userIdSet.add(user.id);
      user.currentRoomId = this.id;
    }
    // const room
  }

  removePlayerInRoom(user: User) {
    if (this.status === RoomStatus.WAITING) {
      // 不确定游戏中是否可以退出，应该可以
      user.currentRoomId = undefined;
      this.userIdSet.delete(user.id);
      if (this.userNumber === 0) {
        this.globals.roomMap.delete(this.id);
      }
    }
  }

  sendChattingMessageToUsers(chatMsg: ChattingMessage) {
    this.sendMessageToUsers(chatMsg, 'reciveChatMessage');
  }

  sendMessageToUsers(data: any, trigger: string, desc?: string) {
    const room = this.globals.roomMap.get(this.id);
    if (room == undefined) return;
    const respMsg = new ResponseMessage(
      data,
      undefined,
      trigger,
      desc ? desc : 'sendMessageToUsers',
    );
    room.users.forEach(u => {
      SenderService.send(u.ws, respMsg);
    });
  }

  sendMessageToUsersButUser(
    data: any,
    trigger: string | undefined,
    butUser: User,
    desc?: string,
  ) {
    const room = this.globals.roomMap.get(this.id);
    if (room == undefined) return;
    const respMsg = new ResponseMessage(
      data,
      undefined,
      trigger,
      desc ? desc : 'sendMessageToUsers',
    );
    room.users.forEach(u => {
      if (u.id !== butUser.id) SenderService.send(u.ws, respMsg);
    });
  }

  refreshRoomList() {
    const roomList = [...this.globals.roomMap.values()];
    const users = [...this.globals.userMap.values()];
    const filtedRoomList = roomList.filter(
      room => room.status === RoomStatus.WAITING && // 不在游戏中
      !room.isFulled && // 没有满
      room.type === RoomType.PUBLIC // 非私人房间)
    );
    users.forEach(u => {
      if (!u.isGaming && u.currentRoomId == undefined) {
        const m = new ResponseMessage(filtedRoomList, undefined, 'refreshRoomList');
        SenderService.send(u.ws, m);
      }
    });
  }
}

