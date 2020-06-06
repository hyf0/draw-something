import { ReservedEventName } from '../../../client/src/types/constants/';
import DrawAction from '../../../client/src/types/models/DrawAction';
import HandlerContext from '../models/HandlerContext';

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

    const drawAction = message.data as DrawAction;

    if (drawAction.type === DrawAction.Type.DRAW_IMAGE) {
      game.newestDrawing = drawAction.payload as string;
    }

    if (drawAction.ignore) return;
    room.sendDataToUsersButUser(
      drawAction,
      ReservedEventName.DRAW_ACTION,
      user,
    );
  }

  static guessAnswer(ctx: HandlerContext) {
    const { user, room, game, req } = ctx;
    if (user == null || room == null || game == null) return;
    const guessedAnswer = req.data as string;
    game.takeGuess(guessedAnswer, user);
  }
}
