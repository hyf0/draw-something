import { EventEmitter } from 'events';

import { ReservedEventName } from '../../shared/constants';
import { RoomStatus, RoomType } from '../../shared/constants/room';
import ChattingMessage from '../../shared/models/ChattingMessage';
import ResponseMessage from '../../shared/models/ResponseMessage';
import { IRoom, IUser } from '../../shared/types';
import { TGlobals } from '../globals';
import { createIncreaseIdGetter } from '../util/helper';
import SenderService from './SenderService';
import User from './User';

const getNextRoomId = createIncreaseIdGetter(1);

export default class Room extends EventEmitter {
  public name: string;
  public type: RoomType;
  public id = getNextRoomId();
  // public userIdSet = new Set<string>(); // 存储user id
  public userMap = new Map<string, User>();
  public status: RoomStatus = RoomStatus.WAITING;
  public maxUserNumber = 8;
  public createAt = Date.now();
  public rounds = 1;
  public gameTime = 60; // 每一场，单位s

  get users() {
    const users = [...this.userMap.values()];
    return users;
  }

  private constructor(args: { name: string; type: RoomType }) {
    super();
    this.name = args.name;
    this.type = args.type;
  }

  static create(args: { name: string; type: RoomType }) {
    return new Room(args);
  }

  has(user: IUser) {
    return this.userMap.has(user.id);
  }

  addUser(user: User) {
    if (this.maxUserNumber === this.userMap.size) {
      throw new Error('房间人数已满');
    } else if (this.status === RoomStatus.GAMING) {
      throw new Error('房间正在游戏中');
    } else {
      if (this.has(user)) return;
      this.userMap.set(user.id, user);
      user.currentRoomId = this.id;
      this.emit('addUser');
    }
  }

  removeUser(user: User, force = false) {
    if (!this.has(user)) return;
    if (force || this.status === RoomStatus.WAITING) {
      user.currentRoomId = undefined;
      user.isReady = false;
      this.userMap.delete(user.id);
      if (this.userMap.size === 0) this.emit('delete');
      this.emit('removeUser');
    }
  }

  sendChatting(chatMsg: ChattingMessage) {
    this.sendDataToUsers(chatMsg, ReservedEventName.ROOM_CHATTING);
  }

  refreshRoomOfUsers = (exclude?: User) => {
    if (exclude == undefined) {
      this.sendDataToUsers(this, ReservedEventName.REFRESH_ROOM);
    } else {
      this.sendDataToUsersButUser(
        this,
        ReservedEventName.REFRESH_ROOM,
        exclude,
      );
    }
  };

  sendDataToUsers(data: any, trigger: string, desc?: string) {
    const respMsg = new ResponseMessage({
      data,
      trigger,
      desc: desc || 'sendMessageToUsers',
    });
    this.users.forEach(u => {
      SenderService.send(u.ws, respMsg);
    });
  }

  sendDataToUsersButUser(
    data: any,
    trigger: string | undefined,
    butUser: User,
    desc?: string,
  ) {
    const respMsg = new ResponseMessage({
      data,
      trigger,
      desc: desc || 'sendMessageToUsers',
    });
    this.users.forEach(u => {
      if (u.id !== butUser.id) SenderService.send(u.ws, respMsg);
    });
  }

  toJSON(): IRoom {
    // 重载对象的JSON.stringfy方法，防止暴露不必要，或私密的属性
    return {
      name: this.name,
      type: this.type,
      id: this.id,
      users: this.users.map(u => u.toJSON()),
      status: this.status,
      maxPlayerNumber: this.maxUserNumber,
      createAt: this.createAt,
      playTimes: this.rounds,
      gameTime: this.gameTime,
    };
  }

  static refreshRoomList(globals: TGlobals) {
    const roomList = [...globals.roomMap.values()];
    const users = [...globals.sesstionUserMap.values()];
    const filtedRoomList = roomList.filter(
      room =>
        room.status === RoomStatus.WAITING && room.type === RoomType.PUBLIC, // 不在游戏中 // 非私人房间
    );
    users.forEach(u => {
      if (!u.isGaming && u.currentRoomId == undefined) {
        const m = new ResponseMessage({
          data: filtedRoomList,
          trigger: ReservedEventName.REFRESH_ROOM_LIST,
        });

        SenderService.send(u.ws, m);
      }
    });
  }
}
