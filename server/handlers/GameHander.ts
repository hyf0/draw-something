import { ReservedEventName } from '../../shared/constants';
import ChattingMessage from '../../shared/models/ChattingMessage';
import DrawAction from '../models/DrawAction';
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

    const { drawAction, newestDrawing } = message.data as {
      drawAction: DrawAction;
      newestDrawing?: string;
    };
    if (newestDrawing !== undefined) {
      game.newestDrawing = newestDrawing;
    }
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
    const isGuessRight = game.takeGuess(guessedAnswer, user);
    if (!isGuessRight) {
      game.sendChatting(
        new ChattingMessage(guessedAnswer, {
          name: user.username,
          id: user.id,
        }),
      );
    }
  }
}
