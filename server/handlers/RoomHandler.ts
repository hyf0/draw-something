import { RoomStatus, RoomType } from '../../shared/constants/room';
import ChattingMessage from '../../shared/models/ChattingMessage';
import HandlerContext from '../models/HandlerContext';
import Game from '../services/Game';
import Room from '../services/Room';

export default class RoomHandler {
  static createRoom(ctx: HandlerContext) {
    const { name, type } = ctx.req.data as {
      name: string;
      type: RoomType;
    };
    const room = Room.create({ name, type });
    ctx.globals.roomMap.set(room.id, room);
    const refreshRoomList = () => Room.refreshRoomList(ctx.globals);
    room.on('addUser', refreshRoomList)
    room.on('removeUser', refreshRoomList)
    room.on('addUser', room.refreshRoomOfUsers);
    room.on('removeUser', room.refreshRoomOfUsers)
    room.once('delete', () => {
      room.off('addUser', refreshRoomList)
      room.off('removeUser', refreshRoomList)
      room.off('addUser', room.refreshRoomOfUsers);
      room.off('removeUser', room.refreshRoomOfUsers)
      ctx.globals.roomMap.delete(room.id);
      refreshRoomList()
    });
    refreshRoomList();
    ctx.sendRespData(room);
  }

  static userEnter(ctx: HandlerContext) {
    const { user } = ctx;
    if (user == undefined) return;
    // 这时候不能从ctx里取room，因为user还没有设置roomId，所以ctx拿不到room
    const { roomId } = ctx.req.data as { roomId: number };
    const room = ctx.globals.roomMap.get(roomId);

    if (room === undefined) {
      ctx.sendRespError(`房间 ${roomId} 不存在`);
      return;
    }
    try {
      room.addUser(user);
      ctx.sendRespData({ room, user });
      room.sendChatting(new ChattingMessage(`${user.username} 进入了游戏`));
      user.once('delete', () => {
        if (room.has(user)) room.removeUser(user, true);
      });
    } catch (err) {
      ctx.sendRespError(err.message);
    }
  }

  static userLeave(ctx: HandlerContext) {
    const { room, user } = ctx;
    if (room == undefined || user == undefined) return;

    room.removeUser(user);
    room.sendChatting(new ChattingMessage(`${user.username} 离开了游戏`));
  }

  static sendChatMessage(ctx: HandlerContext) {
    const { user, room } = ctx;
    if (user == null || room == null) return;
    const { content } = ctx.req.data as {
      content: string;
    };

    room.sendChatting(
      new ChattingMessage(content, {
        id: user.id,
        name: user.username,
      }),
    );
  }

  static roomList(ctx: HandlerContext) {
    const roomList = [...ctx.globals.roomMap.values()];
    const filtedRoomList = roomList.filter(
      room =>
        room.status === RoomStatus.WAITING && // 不在游戏中
        room.type === RoomType.PUBLIC, // 非私人房间)
    );
    ctx.sendRespData(filtedRoomList);
  }

  static startGameIfAllPlayerIsReady(ctx: HandlerContext) {
    const { room, user } = ctx;
    if (room == undefined || user == undefined) return;
    const roomUsers = room.users;
    const readyUsers = roomUsers.filter(u => u.isReady);
    const isAllReady = roomUsers.length > 1 && roomUsers.length === readyUsers.length;
    if (isAllReady) {
      const game = Game.create(room);
      game.start();
      room.users.forEach(rUser => {
        rUser.on('reuse', game.refreshGameUsers);
        rUser.on('offLine', game.refreshGameUsers);
      });
      game.once('delete', () => {
        roomUsers.forEach(rUser => {
          rUser.off('reuse', game.refreshGameUsers);
          rUser.off('offLine', game.refreshGameUsers);
        });
      });
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
    room.refreshRoomOfUsers(user);
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
    room.refreshRoomOfUsers(user);
  }
}
