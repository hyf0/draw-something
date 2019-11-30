import uuidv4 from 'uuid/v4';
import NodeWebsocket from 'ws';
import { EventEmitter } from 'events';

import { IUser } from '../../shared/types';
import globals from '../globals';
import { log } from '../util/helper';
import DataService from './DataService';

// import { ReservedEventName } from 'shared/constants';

export default class User extends EventEmitter {
  token = uuidv4(); // 临时登录凭证
  id = uuidv4();
  currentRoomId: undefined | number; // 房间号
  isGaming = false;
  isOnLine = true;
  username = DataService.getRandomName();
  isReady = false;
  lastActiveTime = Date.now();
  timerId: {
    deleteUser?: NodeJS.Timeout;
  } = {};

  static create(ws: NodeWebsocket) {
    return new User(ws);
  }

  private constructor(public ws: NodeWebsocket) {
    super();
    this.bindEvents(ws);
    globals.sesstionUserMap.set(this.token, this);
    // globals.userMap.set(this.id, this);
  }

  toJSON(): IUser {
    return {
      token: this.token,
      id: this.id,
      currentRoomId: this.currentRoomId,
      isGaming: this.isGaming,
      isOnLine: this.isOnLine,
      username: this.username,
      lastActiveTime: this.lastActiveTime,
      isReady: this.isReady,
    };
  }

  bindEvents(ws: NodeWebsocket) {
    ws.on('close', this.cleanUp);
  }

  reuse(newWs: NodeWebsocket) {
    this.ws.off('close', this.cleanUp);
    this.ws = newWs;
    this.bindEvents(newWs);
    //
    this.isOnLine = true;
    this.lastActiveTime = Date.now();

    if (this.timerId.deleteUser !== undefined) { // 清除清理定时器
      clearTimeout(this.timerId.deleteUser);
    }

    this.emit('reuse');
  }

  cleanUp = () => {
    this.isOnLine = false;
    this.emit('offLine');
    this.timerId.deleteUser = setTimeout(() => {
      // 不论在干嘛，超时就直接删除，通报个 delete 事件，由订阅者决定怎么办
      log(`${this.username} is deleted`);
      globals.sesstionUserMap.delete(this.token);
      // globals.userMap.delete(this.token);
      this.emit('delete');
    }, 60 * 1000); //用户断线重连的时间为1分钟，然后就进行清理

  };

  changeUsername(newUsername: string) {
    this.username = newUsername;
  }
}
