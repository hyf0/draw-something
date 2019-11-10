import HandlerContext from '../models/HandlerContext';
import { RoomStatus, RoomType } from '../util/contants';
import Room from '../services/Room';
import ChattingMessage from '../models/ChattingMessage';
import Game from '../services/Game';

export default class RoomHandler {
  static createRoom(ctx: HandlerContext) {
    const { name, type } = ctx.req.data as {
      name: string;
      type: RoomType;
    };
    const room = new Room({ name, type }, ctx.globals);
    ctx.sendRespData(room);
  }

  static userEnter(ctx: HandlerContext) {
    const { user } = ctx;
    if (user == undefined) return;
    // 这时候不能从ctx里取room，因为user还没有设置roomId，所以ctx拿不到room
    const { id: roomId } = ctx.req.data as { id: number };
    const room = ctx.globals.roomMap.get(roomId);

    if (room == null) {
      ctx.sendRespError('房间不存在');
    } else {
      room.addPlayerToRoom(user);
      ctx.sendRespData({
        room,
        user,
      });

      room.sendMessageToUsersButUser(
        room,
        'refreshRoomInfo',
        user,
        `${user.username} 进入了游戏`,
      ); // 针对房间里其他人
      room.sendChattingMessageToUsers(
        new ChattingMessage(`${user.username} 进入了游戏`, {
          name: '游戏平台',
          id: 'game',
        }),
      );
    }
  }

  static userLeave(ctx: HandlerContext) {
    const { room, user } = ctx;
    if (room == undefined || user == undefined) return;
    room.removePlayerInRoom(user);
    room.sendMessageToUsers(room, 'refreshRoomInfo');
    room.sendChattingMessageToUsers(
      new ChattingMessage(`${user.username} 离开了游戏`, {
        name: '游戏平台',
        id: 'game',
      }),
    );
  }

  static sendChatMessage(ctx: HandlerContext) {
    const { user, room } = ctx;
    if (user == null) return;
    const { content } = ctx.req.data as {
      content: string;
    };
    if (room == null) {
      ctx.sendRespError('房间不存在');
      return;
    }
    room.sendChattingMessageToUsers(
      new ChattingMessage(content, {
        id: user.id,
        name: user.username,
      }),
    );
  }

  static roomList(ctx: HandlerContext) {
    const roomList = [...ctx.globals.roomMap.values()];
    const filtedRoomList = roomList.filter(
      room => room.status === RoomStatus.WAITING && // 不在游戏中
      !room.isFulled && // 没有满
      room.type === RoomType.PUBLIC // 非私人房间)
    );
    ctx.sendRespData(filtedRoomList);
  }

  static startGameIfAllPlayerIsReady(ctx: HandlerContext) {
    const { room, user } = ctx;
    if (room == undefined || user == undefined) return;
    const usersOfRoom = room.users;
    const readyUsers = usersOfRoom.filter(u => u.isReady);
    if (usersOfRoom.length > 1 && usersOfRoom.length === readyUsers.length) {
      usersOfRoom.forEach(u => u.isGaming = true);
      const game = new Game(room, ctx.globals);
      room.status = RoomStatus.GAMING;
      room.sendMessageToUsers({
        user,
        game,
      }, 'startGame');
    }
  }

  static makeGameReady(ctx: HandlerContext) {
    const { user, room } = ctx;
    if (room == undefined || user == undefined) return;

    user.isReady = true;
    ctx.sendRespData({
      user,
      room,
    });

    room.sendMessageToUsersButUser(
      room,
      'refreshRoomInfo',
      user,
      `${user.username} 准备了`,
    );

    RoomHandler.startGameIfAllPlayerIsReady(ctx);
  }

  static cancelGameReady(ctx: HandlerContext) {
    const { user, room } = ctx;
    if (room == undefined || user == undefined) return;

    user.isReady = false;
    ctx.sendRespData({
      user,
      room,
    });
    room.sendMessageToUsersButUser(
      room,
      'refreshRoomInfo',
      user,
      `${user.username} 取消准备了`,
    );
  }
}
