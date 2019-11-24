import uuidv4 from 'uuid/v4';
import NodeWebsocket from 'ws';

import { ReservedEventName } from '../../shared/constants';
import { IUser } from '../../shared/types';
import globals from '../globals';
import { log } from '../util/helper';
import DataService from './DataService';

// import { ReservedEventName } from 'shared/constants';

export default class User {
  token = uuidv4();
  id = uuidv4();
  currentRoomId: undefined | number;
  isGaming = false;
  isOnline = true;
  username = DataService.getRandomName();
  isReady = false;
  lastActiveTime = Date.now();
  timerId: {
    deleteUser?: NodeJS.Timeout;
    deleteRoom?: NodeJS.Timeout;
  } = {};
  constructor(public ws: NodeWebsocket) {
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
    };
  }

  bindEvents(ws: NodeWebsocket) {
    ws.on('close', this.cleanUp);
  }

  reuse(newWs: NodeWebsocket) {
    this.ws = newWs;
    //
    this.isOnline = true;
    this.lastActiveTime = Date.now();


    Object.values(this.timerId).forEach(timerId => {
      if (timerId !== undefined) clearTimeout(timerId);
    });
    // if (this.timerId.deleteUser !== undefined) {
    //   // 清除清理定时器
    //   clearTimeout(this.timerId.deleteUser);
    // }
    // if (this.timerId.deleteRoom !== undefined) {
    //   clearTimeout(this.timerId.deleteRoom);
    // }

    const room = globals.roomMap.get(this.currentRoomId || -1);
    if (room !== undefined) {
      if (this.isGaming) {
        const game = globals.gameMap.get(room.id);
        if (game !== undefined) { // 如果重连在游戏，通告自己上线了
          room.sendDataToUsersButUser(game, ReservedEventName.REFRESH_GAME, this, `${this.username} 上线了`);
        }
      }
    }

    this.bindEvents(newWs);
  }

  cleanUp = () => {
    this.isOnline = false;

    const room = globals.roomMap.get(this.currentRoomId || -1);
    if (room !== undefined) {
      if (this.isGaming) {
        // 在游戏中时候，断线的逻辑
        const game = globals.gameMap.get(room.id);
        if (game !== undefined) {
          room.sendDataToUsersButUser(game, ReservedEventName.REFRESH_GAME, this, `${this.username} 断线`);
        }
      }

      // 在房间里的时候，断线的逻辑
      const roomUsers = room.users;
      const isMeTheHost = roomUsers.length > 0 && roomUsers[0].id === this.id;
      const removeSelfInRoom = () => {
        room.removePlayerInRoom(this);
        room.sendDataToUsers(room, ReservedEventName.REFRESH_ROOM);
      }
      if (isMeTheHost) {
        // 房主的退出会有一个延迟，避免房主刷新下，就自动转交房主了
        this.timerId.deleteRoom = setTimeout(removeSelfInRoom, 30 * 1000); // 注意这里的时间，最好比 delete user的小，用delete user后，user已经是个死用户，永不可能恢复，此时被占用的房间也死房间了
      } else removeSelfInRoom(); // 不是房主的情况下会立即退出
    }

    // todo 游戏时，用户断线怎么办

    this.timerId.deleteUser = setTimeout(() => {
      // 不论在干嘛，超时就直接删除
      log(`${this.username} is deleted`);
      globals.sesstionUserMap.delete(this.token);
      globals.userMap.delete(this.token);
    }, 60 * 1000); //用户断线重连的时间为1分钟，然后就进行清理
  };

  changeUsername(newUsername: string) {
    this.username = newUsername;
  }
}
