import { EventEmitter } from 'events';

import { ReservedEventName } from '../../shared/constants';
import { RoomStatus, RoomType } from '../../shared/constants/room';
import ChattingMessage from '../../shared/models/ChattingMessage';
import ResponseMessage from '../../shared/models/ResponseMessage';
import { IRoom, IUser } from '../../shared/types';
import globals from '../globals';
import { createIncreaseIdGetter } from '../util/helper';
import SenderService from './SenderService';
import User from './User';

const getNextRoomId = createIncreaseIdGetter(1);

export default class Room extends EventEmitter {
  public name: string;
  public type: RoomType;
  public id = getNextRoomId();
  public userIdSet = new Set<string>(); // 存储user id
  public status: RoomStatus = RoomStatus.WAITING;
  public maxUserNumber = 8;
  public createAt = Date.now();
  public rounds = 1;
  public gameTime = 60; // 每一场，单位s

  get users() {
    const userIds = [...this.userIdSet.keys()];
    const users = userIds.map(uid => {
      const user = globals.userMap.get(uid);
      if (user === undefined)
        throw new Error(`users 错误，未找到 ${uid} 对应的用户`);
      return user;
    });
    return users;
  }

  get userNumber() {
    return this.userIdSet.size;
  }

  get isFulled() {
    return this.userNumber === this.maxUserNumber;
  }

  private constructor(
    args: {
      name: string;
      type: RoomType;
    }
  ) {
    super();
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
    const eventsName = ['addUser', 'removeUser'];
    eventsName.forEach(evtName => {
      created.on(evtName, Room.refreshRoomList);
    });
    created.once('delete', () => {
      eventsName.forEach(evtName => {
        created.off(evtName, Room.refreshRoomList);
      });
    });
    return created;
  }

  has(user: IUser) {
    return this.userIdSet.has(user.id);
  }

  addUser(user: User) {
    if (this.isFulled) {
      throw new Error('房间人数已满');
    } else if (this.status === RoomStatus.GAMING) {
      throw new Error('房间正在游戏中');
    } else {
      this.userIdSet.add(user.id);
      user.currentRoomId = this.id;

      const removeUserWhenDeleted = () => {
        user.off('reuse', cancelRemoveWhenReused);
        if (this.has(user)) this.removeUser(user);
      }
      const cancelRemoveWhenReused = () => {
        user.off('delete', removeUserWhenDeleted);
      }
      // 一个竞态，谁先触发，就删除对方
      user.once('reuse', cancelRemoveWhenReused); // 当 user 被删除的时候，退出房间
      user.once('delete', removeUserWhenDeleted); // 当 user 重连时 取消删除
      this.emit('addUser');
    }
    // const room
  }

  removeUser(user: User) {
    if (this.status === RoomStatus.WAITING) {
      user.currentRoomId = undefined;
      user.isReady = false;
      this.userIdSet.delete(user.id);
      if (this.userNumber === 0) {
        globals.roomMap.delete(this.id);
        this.emit('delete');
      }
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
      this.sendDataToUsersButUser(this, ReservedEventName.REFRESH_ROOM, exclude);
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

  toJSON(): IRoom { // 重载对象的JSON.stringfy方法，防止暴露不必要，或私密的属性
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
