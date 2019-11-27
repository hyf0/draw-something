import { ReservedEventName } from '../../shared/constants';
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
    Room.refreshRoomList();
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
      room.refreshRoomOfUsers(user); // 针对房间里其他人,刷新房间信息
      room.sendChatting(new ChattingMessage(`${user.username} 进入了游戏`));
    } catch (err) {
      ctx.sendRespError(err.message);
    }
  }

  static userLeave(ctx: HandlerContext) {
    const { room, user } = ctx;
    if (room == undefined || user == undefined) return;

    room.removeUser(user);
    room.refreshRoomOfUsers(); // 针对房间里其他人,刷新房间信息

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
        !room.isFulled && // 没有满
        room.type === RoomType.PUBLIC, // 非私人房间)
    );
    ctx.sendRespData(filtedRoomList);
  }

  static startGameIfAllPlayerIsReady(ctx: HandlerContext) {
    const { room, user } = ctx;
    if (room == undefined || user == undefined) return;
    const usersOfRoom = room.users;
    const readyUsers = usersOfRoom.filter(u => u.isReady);
    if (usersOfRoom.length > 1 && usersOfRoom.length === readyUsers.length) {
      usersOfRoom.forEach(u => (u.isGaming = true));
      const game = Game.create(room);
      room.status = RoomStatus.GAMING;
      usersOfRoom.forEach(u => (u.isReady = false)); // 重置user.isReady状态

      room.sendDataToUsers({ user, game }, ReservedEventName.START_GAME);

      Room.refreshRoomList(); // 房间信息变化，刷新房间列表
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
