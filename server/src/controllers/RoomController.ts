import uuidv4 from 'uuid/v4';

import { IControllerContext } from '../types';
import RoomService from '../services/RoomService';
import { RoomStatus, RoomType } from '../util/contants';
import ChattingMessage from '../models/ChattingMessage';
import GameService from '../services/GameService';

export default class RoomConroller {
  static createRoom(ctx: IControllerContext) {
    const { name, type } = ctx.message.data as {
      name: string;
      type: RoomType;
    };
    const room = new RoomService(
      {
        name,
        type,
        ws: ctx.ws,
      },
      ctx.globalMaps,
    );
    ctx.globalMaps.roomMap.set(room.id, room);
    ctx.sendRespData(room);
  }

  static playerEnter(ctx: IControllerContext) {
    const { id: roomId } = ctx.message.data as { id: number };
    console.log(roomId);
    const room = ctx.globalMaps.roomMap.get(roomId);

    if (room == null) {
      ctx.sendRespError('房间不存在');
    } else {
      room.addPlayerToRoom(ctx.user);
      ctx.sendRespData({
        room,
        user: ctx.user,
      });

      room.sendMessageToUsersButUser(room, 'refreshRoomInfo', ctx.user, `${ctx.user.username} 进入了游戏`); // 针对房间里其他人

      room.sendChattingMessageToUsers({
        speaker: {
          name: '游戏平台',
          id: 'game',
        },
        timestamp: Date.now(),
        content: `${ctx.user.username} 进入了游戏`,
        id: uuidv4(),
      });
    }
  }

  static roomList(ctx: IControllerContext) {
    const roomList: RoomService[] = [];
    for (let r of ctx.globalMaps.roomMap.values()) {
      if (
        r.status === RoomStatus.WAITING && // 不在游戏中
        !r.isFulled && // 没有满
        r.type === RoomType.PUBLIC // 非私人房间
      ) {
        roomList.push(r);
      }
    }
    ctx.sendRespData(roomList);
  }

  static playerLeave(ctx: IControllerContext) {
    const { room } = ctx;
    if (room == null) return;
    else {
      room.removePlayerInRoom(ctx.user);

      room.sendMessageToUsers(room, 'refreshRoomInfo');
      room.sendChattingMessageToUsers(
        new ChattingMessage(`${ctx.user.username} 离开了游戏`, {
          name: '游戏平台',
          id: 'game',
        }),
      );
    }
  }

  static startGameIfAllPlayerIsReady(ctx: IControllerContext) {
    const { room } = ctx;
    if (room == null) return;
    const usersOfRoom = [...room.users.values()];
    const readyUsers = usersOfRoom.filter(u => u.isReady);
    if (usersOfRoom.length > 1 && usersOfRoom.length === readyUsers.length) {
      usersOfRoom.forEach(u => u.isGaming = true);
      const game = new GameService(room, ctx.globalMaps);
      room.status = RoomStatus.GAMING;
      room.sendMessageToUsers({
        user: ctx.user,
        game,
      }, 'startGame');
    }
  }

  static makeGameReady(ctx: IControllerContext) {
    const { user, room } = ctx;
    if (room == null) return;
    user.isReady = true;
    ctx.sendRespData({
      user,
      room,
    });
    room.sendMessageToUsersButUser(room, 'refreshRoomInfo', user, `${user.username} 准备了`);
    RoomConroller.startGameIfAllPlayerIsReady(ctx);
  }

  static cancelGameReady(ctx: IControllerContext) {
    const { user, room } = ctx;
    user.isReady = false;
    if (room != null) {
      ctx.sendRespData({
        user,
        room,
      });
      room.sendMessageToUsersButUser(room, 'refreshRoomInfo', user, `${user.username} 取消准备了`);
    }
  }

  static sendChatMessage(ctx: IControllerContext) {
    const { content } = ctx.message.data as {
      content: string;
    };
    const user = ctx.user;
    if (user.currentRoomId == null) {
      ctx.sendRespError('房间不存在');
      return;
    }
    const room = ctx.globalMaps.roomMap.get(user.currentRoomId);
    if (room != null) {
      room.sendChattingMessageToUsers({
        id: uuidv4(),
        speaker: {
          id: ctx.user.id,
          name: ctx.user.username,
        },
        content,
        timestamp: Date.now(),
      });
    }
  }
}
