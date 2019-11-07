import { IControllerContext } from "../types";
import DrawAction from "../models/DrawAction";

export default class GameController {
  static getGame(ctx: IControllerContext) {
    const { user, room, game } = ctx;
    if (!user.isGaming && room != null && game != null) {
      ctx.sendRespData({
        user,
        game,
      });
      return;
    }
    ctx.sendRespError('没有在进行游戏');


  }

  static drawAction(ctx: IControllerContext) {
    const { user, room, game, message } = ctx;
    const { drawAction, currentDrawing } = message.data as {
      drawAction: DrawAction,
      currentDrawing: string;
    }
    if (room != null && game != null) {
      game.newestDrawing = currentDrawing;
      room.sendMessageToUsersButUser(drawAction, 'drawAction', user);
    }
  }
}
