import NodeWebsocket from 'ws';
import uuidv4 from 'uuid/v4';

import DataService from './DataService';
import { TGlobals } from '../globals';
import { log } from '../util/helper';
import { IUser } from '@shared/types';

export default class User {
  public token = uuidv4();
  public id = uuidv4();
  public currentRoomId: undefined | number;
  public isGaming = false;
  public isOnline = true;
  public clearTimerId: NodeJS.Timeout | undefined;
  public username = DataService.getRandomName();
  public isReady = false;
  public lastActiveTime = Date.now();
  constructor(public ws: NodeWebsocket, private globals: TGlobals) {
    this.bindEvents(ws);
    globals.sesstionUserMap.set(this.token, this);
    globals.userMap.set(this.id, this);
  }

  toJSON(): IUser {
    return {
      token: this.token,
      id: this.id,
      currentRoomId: this.currentRoomId,
      isGaming: this.isGaming,
      isOnline: this.isOnline,
      username: this.username,
      lastActiveTime: this.lastActiveTime,
      isReady: this.isReady,
    }
  }

  bindEvents(ws: NodeWebsocket) {
    ws.on('close', this.cleanUp.bind(this));
  }

  reuse(newWs: NodeWebsocket) {
    this.isOnline = true;
    this.ws = newWs;
    if (this.clearTimerId != undefined) {
      clearTimeout(this.clearTimerId);
    }
    this.lastActiveTime = Date.now();

    this.bindEvents(newWs);
  }

  cleanUp() {
    this.isOnline = false;

    // todo 用户离开，在房间里面删除他

    this.clearTimerId = setTimeout(() => {
      // 注意还没有用户在游戏中的时候，是否要删除他
      log(`${this.username} is deleted`);
      this.globals.sesstionUserMap.delete(this.token);
      this.globals.userMap.delete(this.token);
    }, 1000 * 60 * 10);
  }

  // login(token?: string) {

  //   let isReusedOffLineUser = false;
  //   if (isString(token)) {
  //     const offLineUser = this.globalMaps.userMap.get(token);
  //     if (offLineUser != null) {
  //       isReusedOffLineUser = true;
  //       this.reuse(offLineUser);
  //     }
  //   }

  //   if (!isReusedOffLineUser) {
  //     this.username = DataService.getRandomName();
  //   }

  //   ctx.globalMaps.userMap.set(this.token, this);

  //   if (IS_DEV) {
  //     console.log(
  //       `${this.username} logined, current users:`,
  //       [...this.globalMaps.userMap.values()].map(c => c.username).join('-'),
  //     );
  //   }

  //   this.isLogined = true;
  //   ctx.sendRespData(this);
  // }

  changeUsername(newUsername: string) {
    this.username = newUsername;
  }
}
