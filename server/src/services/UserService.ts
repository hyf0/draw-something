import NodeWebsocket from 'ws';
import uuidv4 from 'uuid/v4';
import { TGlobalMaps } from '..';
import DataService from './DataService';
import { IMessage, IControllerContext } from '../types';
import SenderService from './SenderService';
import { IS_DEV } from '../util/contants';
import { isString } from '../validator/isString';

export default class UserService {
  public token = uuidv4();
  public id = uuidv4();
  public currentRoomId: null | number = null;
  public isGaming = false;
  public isOnline = true;
  public clearTimerId: NodeJS.Timeout | null = null;
  public username = 'guest';
  public isLogined = false;
  public isReady = false;
  lastActiveTime = Date.now();
  constructor(public ws: NodeWebsocket, public globalMaps: TGlobalMaps) {
    this.bindEvents(ws);
  }

  toJSON() {
    return {
      token: this.token,
      id: this.id,
      currentRoomId: this.currentRoomId,
      isGaming: this.isGaming,
      isOnline: this.isOnline,
      username: this.username,
      isLogined: this.isLogined,
      lastActiveTime: this.lastActiveTime,
      isReady: this.isReady,
    }
  }

  bindEvents(ws: NodeWebsocket) {
    ws.on('close', () => {
      this.cleanUp();
    });
  }

  reuse(u: UserService) {
    u.isOnline = true;
    if (u.clearTimerId != null) {
      clearTimeout(u.clearTimerId);
    }

    if (u.currentRoomId != null) {
      const room = this.globalMaps.roomMap.get(u.currentRoomId);
      if (room != null) {
        room.users.set(u.token, this);
      }
    }



    this.token = u.token;
    this.id = u.id;
    this.isOnline = u.isOnline;
    this.isGaming = u.isGaming;
    this.currentRoomId = u.currentRoomId;
    this.username = u.username;
  }

  cleanUp() {
    this.isOnline = false;

    // todo 用户离开，在房间里面删除他

    this.clearTimerId = setTimeout(() => {
      // 注意还没有用户在游戏中的时候，是否要删除他
      this.globalMaps.userMap.delete(this.token);
    }, 1000 * 60);
  }

  // sendMessageToUser(data: any, type: string) {
  //   this.sender.sendMessage({
  //     type,
  //     data,
  //   });
  // }

  // sendErrorMessageToUser(msg: IMessage) {
  //   this.sender.sendMessage(msg);
  // }

  login(ctx: IControllerContext) {
    const token = ctx.message.data;

    let isReusedOffLineUser = false;
    if (isString(token)) {
      const offLineUser = this.globalMaps.userMap.get(token);
      if (offLineUser != null) {
        isReusedOffLineUser = true;
        this.reuse(offLineUser);
      }
    }

    if (!isReusedOffLineUser) {
      this.username = DataService.getRandomName();
    }

    ctx.globalMaps.userMap.set(this.token, this);

    if (IS_DEV) {
      console.log(
        `${this.username} logined, current users:`,
        [...this.globalMaps.userMap.values()].map(c => c.username).join('-'),
      );
    }

    this.isLogined = true;
    ctx.sendRespData(this);
  }

  changeUsername(newUsername: string) {
    if (this.isLogined) {
      this.username = newUsername;
    }
  }
}
