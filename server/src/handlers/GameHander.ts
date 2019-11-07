import DrawAction from "../models/DrawAction";
import HandlerContext from "../models/HandlerContext";

export default class GameHandler {
  static getGame(ctx: HandlerContext) {
    const { user, room, game } = ctx;
    if (user == null || room == null || game == null) return;
    if (!user.isGaming) {
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

    const { drawAction, currentDrawing } = message.data as {
      drawAction: DrawAction,
      currentDrawing: string;
    }

    game.newestDrawing = currentDrawing;
    room.sendMessageToUsersButUser(drawAction, 'drawAction', user);
  }
}
