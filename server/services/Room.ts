import { RoomStatus, RoomType } from '../../shared/constants/room';
import ChattingMessage from '../../shared/models/ChattingMessage';
import ResponseMessage from '../../shared/models/ResponseMessage';
import { IRoom, IUser } from '../../shared/types';
import globals, { TGlobals } from '../globals';
import { createIncreaseIdGetter } from '../util/helper';
import SenderService from './SenderService';
import User from './User';
import { ReservedEventName } from '../../shared/constants';

const getNextRoomId = createIncreaseIdGetter(1);

export default class Room {
  public name: string;
  public type: RoomType;
  public id = getNextRoomId();
  public userIdSet = new Set<string>(); // 存储user id
  public status: RoomStatus = RoomStatus.WAITING;
  public maxPlayerNumber = 8;
  public createAt = Date.now();
  public rounds = 1;
  public gameTime = 60; // 每一场，单位s

  get users() {
    const userIds = [...this.userIdSet.keys()];
    const users = userIds.map(uid => {
      const user = globals.userMap.get(uid);
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

  private constructor(
    args: {
      name: string;
      type: RoomType;
    }
  ) {
    this.name = args.name;
    this.type = args.type;
  }

  static create(
    args: {
      name: string;
      type: RoomType;
    }
  ) {
    const created = new Room(args);
    globals.roomMap.set(created.id, created);
    Room.refreshRoomList();
    return created;
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
      playTimes: this.rounds,
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

      Room.refreshRoomList(); // 刷新公共房间列表
    }
    // const room
  }

  removePlayerInRoom(user: User) {
    if (this.status === RoomStatus.WAITING) {
      user.currentRoomId = undefined;
      user.isReady = false;
      this.userIdSet.delete(user.id);
      if (this.userNumber === 0) {
        globals.roomMap.delete(this.id);
      }

      Room.refreshRoomList(); // 刷新公共房间列表
    }
  }

  sendChatting(chatMsg: ChattingMessage) {
    this.sendDataToUsers(chatMsg, ReservedEventName.ROOM_CHATTING);
  }

  refreshRoomOfUsers(excludedUser?: User) {
    if (excludedUser == undefined) {
      this.sendDataToUsers(this, ReservedEventName.REFRESH_ROOM);
    } else {
      this.sendDataToUsersButUser(this, ReservedEventName.REFRESH_ROOM, excludedUser);
    }
  }

  sendDataToUsers(data: any, trigger: string, desc?: string) {
    const room = globals.roomMap.get(this.id);
    if (room == undefined) return;
    const respMsg = new ResponseMessage({
      data,
      trigger,
      desc: desc || 'sendMessageToUsers',
    });
    room.users.forEach(u => {
      SenderService.send(u.ws, respMsg);
    });
  }

  sendDataToUsersButUser(
    data: any,
    trigger: string | undefined,
    butUser: User,
    desc?: string,
  ) {
    const room = globals.roomMap.get(this.id);
    if (room == undefined) return;
    const respMsg = new ResponseMessage({
      data,
      trigger,
      desc: desc || 'sendMessageToUsers',
    });
    room.users.forEach(u => {
      if (u.id !== butUser.id) SenderService.send(u.ws, respMsg);
    });
  }

  static refreshRoomList() {
    const roomList = [...globals.roomMap.values()];
    const users = [...globals.userMap.values()];
    const filtedRoomList = roomList.filter(
      room =>
        room.status === RoomStatus.WAITING && // 不在游戏中
        !room.isFulled && // 没有满
        room.type === RoomType.PUBLIC, // 非私人房间
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
