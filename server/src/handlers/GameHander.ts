import DrawAction from "../models/DrawAction";
import HandlerContext from "../models/HandlerContext";

export default class GameHandler {
  static getGame(ctx: HandlerContext) {
    const { user, room, game } = ctx;
    if (user == null) return;
    if (!user.isGaming || room == null || game == null) {
      ctx.sendRespError('没有在进行游戏');
    } else {
      ctx.sendRespData({
        user,
        game,
      });
    }
  }

  static drawAction(ctx: HandlerContext) {
    const { user, room, game, req: message } = ctx;
    if (user == null || room == null || game == null) return;

    const { drawAction, newestDrawing } = message.data as {
      drawAction: DrawAction,
      newestDrawing: string;
    }

    game.newestDrawing = newestDrawing;
    room.sendMessageToUsersButUser(drawAction, 'drawAction', user);
  }
}
