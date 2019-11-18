import ChattingMessage from '../../shared/models/ChattingMessage';
import ResponseMessage from '../../shared/models/ResponseMessage';
import DrawAction from '../models/DrawAction';
import HandlerContext from '../models/HandlerContext';
import SenderService from '../services/SenderService';

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
      newestDrawing: string;
    };

    game.newestDrawing = newestDrawing;
    room.sendMessageToUsersButUser(drawAction, 'drawAction', user);
  }

  static guessAnswer(ctx: HandlerContext) {
    const { user, room, game, req } = ctx;
    if (user == null || room == null || game == null) return;
    const guessedAnswer = req.data as string;
    const isGuessRight = game.takeGuess(guessedAnswer, user);
    if (isGuessRight) {
      room.sendMessageToUsers({ game }, 'refreshGame', '刷新本次猜测获得的分数');
      room.sendMessageToUsers(
        new ChattingMessage(`${user.username} 猜对了，加 1 分！`, {
          name: '你画我猜',
          id: 'game',
        }),
        'chattingMessage',
      );
      if (game.isPlayOver) {
        game.startNextPlay(); // 切换，下一个玩家画画，下一轮的逻辑也在这个函数里面
        if (game.isGameOver) { // 游戏所有轮数都结束了，准备删除本次游戏

          room.sendMessageToUsers({
            user,
          }, 'gameOver', '游戏结束');
          // const usersOrderedByScroe = game.users.sort((ua, ub) => {
          //   return game.userScores[ub.id] - game.userScores[ua.id];
          // });
          // room.sendChattingMessageToUsers(new ChattingMessage(`游戏结束，赢家是 ${usersOrderedByScroe[0].username}!`, {
          //   name: '你画我猜',
          //   id: 'game',
          // }))
        } else {
          room.sendMessageToUsers({ game }, 'changePlayingUser', '切换到下一个玩家');
        }
      }
      SenderService.send(
        user.ws,
        new ResponseMessage(
          {
            game,
          },
          undefined,
          'guessAnswerRight',
        ),
      );
      // room.sendMessageToUsersButUser({game},'refreshGame', user);
    } else {
      room.sendMessageToUsers(
        new ChattingMessage(guessedAnswer, {
          name: user.username,
          id: user.id,
        }),
        'chattingMessage',
      );
    }
  }
}
