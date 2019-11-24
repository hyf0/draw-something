import DataService from './DataService';
import globals from '../globals';
import Room from './Room';
import { IGame } from '../../shared/types';
import User from './User';
import { RoomStatus } from '../../shared/constants/room';
import SenderService from './SenderService';
import { ReservedEventName } from '../../shared/constants';
import ChattingMessage from '../../shared/models/ChattingMessage';
import { logError } from '../util/helper';
import ResponseMessage from '../../shared/models/ResponseMessage';

// play 场，每个人画的时候算一场
// round 轮，每个人都画了一次算一轮

function createKeyword(arg: [string, string]) {
  return {
    raw: arg[0],
    hint: arg[1],
  };
}

export default class Game {
  playTimes = this.room.rounds;
  userScores: {
    [userId: string]: number;
  } = {};
  currentTimes = 1;

  // 每一轮会更改的

  rounds: number; // 还剩几轮游戏, 这里默认写了1轮，到后期，应该是可以根据创建房间时的参数调节

  // 每一次play会更改的

  newestDrawing: string | undefined;
  scoreForNextGuessRight = 4; // 第一个猜对的人4分，依次递减，最低1分
  numOfRightGuesser = 0;
  isOverTime = false;
  playInfo = {
    keyword: createKeyword(DataService.getRandomGameKeyword()),
    currentPlayer: this.users[0],
    time: this.room.gameTime,
  };

  // 每一次play和每一轮都会更改的

  nextGuesserIndex = 0;

  // 初始化，不会在游戏的过程中更改的属性
  offLineUserIdSet = new Set<string>();
  gameTime: number; // 每一场的游戏时间
  scoreForCurrentDrawer = 2; // 每次有人才对，绘画者加2分

  get users() {
    return this.room.users;
  }
  get onLineUsers() {
    return this.room.users.filter(u => !this.offLineUserIdSet.has(u.id));
  }
  get offLineUsers() {
    return this.room.users.filter(u => this.offLineUserIdSet.has(u.id));
  }
  get isGameOver() {
    return this.rounds < 0; // rounds 表示的还剩多少轮，等于0表示没有下一轮了，但不表示游戏已经结束
  }
  get isPlayOver() {
    // 一个是除了画家的玩家都猜对了，一个是到游戏到时间了
    const onLineUsersWithoutDrawer = this.onLineUsers.filter(
      u => u.id !== this.playInfo.currentPlayer.id, // 画家自己不参与猜测，之所以不直接 - 1，是因为画家也能断线
    );
    return this.numOfRightGuesser >= onLineUsersWithoutDrawer.length;
  }

  constructor(private room: Room) {
    globals.gameMap.set(room.id, this);

    this.rounds = room.rounds;
    this.gameTime = room.gameTime;
    room.users.forEach(u => {
      this.userScores[u.id] = 0;
    });

    this.startNextRound(true);
  }

  gameOver() {
    globals.gameMap.delete(this.room.id);
    this.room.status = RoomStatus.WAITING;
    this.users.forEach(u => {
      u.isGaming = false;
      SenderService.send(
        u.ws,
        new ResponseMessage({
          data: {
            user: u,
            // room: this.room,
          },
          trigger: ReservedEventName.GAME_OVER,
        }),
      );
    });
  }

  findNextDrawer() {
    // 如果返回 undefined，则说明全员离线了
    const users = this.users;
    // if (this.nextGuesserIndex >= users.length) this.nextGuesserIndex = 0;
    while (this.nextGuesserIndex < users.length) {
      const guesser = users[this.nextGuesserIndex];
      this.nextGuesserIndex += 1;
      if (guesser.isOnline) return guesser;
    }
    if (this.offLineUsers.length === users.length)
      throw new Error('全员离线，找不到下一个 Drawer');
    return undefined;
  }

  sendChatting(chat: ChattingMessage) {
    this.room.sendDataToUsers(chat, ReservedEventName.GAME_CHATTING);
  }

  takeGuess(guessAnswer: string, guesser: User) {
    const rightAnswer = this.playInfo.keyword.raw;
    if (rightAnswer === guessAnswer) {
      // 分数相关
      this.userScores[guesser.id] += this.scoreForNextGuessRight;
      this.userScores[
        this.playInfo.currentPlayer.id
      ] += this.scoreForCurrentDrawer;
      this.room.sendDataToUsers(
        this,
        ReservedEventName.REFRESH_GAME,
        `${guesser.username} 猜对了, 刷新分数信息`,
      );
      this.sendChatting(
        new ChattingMessage(
          `${guesser.username} 猜对了, 加${this.scoreForNextGuessRight}分`,
        ),
      );

      this.numOfRightGuesser += 1;
      if (this.isPlayOver) {
        this.room.sendDataToUsers(undefined, ReservedEventName.PLAY_OVER);
        this.stopCountDownPlayTime();
        this.startNextPlay(9000); // 给前端留出分数结算时间
      }

      // 收尾
      this.scoreForNextGuessRight = Math.max(
        1,
        this.scoreForNextGuessRight - 1,
      ); // 保证scoreForNextGuessRight最小值为 1

      return true;
    }
    return false;
  }

  private startNextRound(isImmediate: boolean = false) {
    this.rounds -= 1;
    if (this.rounds < 0) {
      this.gameOver();
      return;
    }

    this.nextGuesserIndex = 0;

    this.startNextPlay(isImmediate ? undefined : 9000);
  }

  playTimeCountDownTimerId: undefined | NodeJS.Timeout;
  startCountDownPlayTime() {
    if (this.playTimeCountDownTimerId !== undefined) {
      clearTimeout(this.playTimeCountDownTimerId);
    }
    this.playTimeCountDownTimerId = setTimeout(this.countDownPlayTime.bind(this), 1000);
  }
  countDownPlayTime() {
    let oldTime = this.playInfo.time;
    if (oldTime > 0) {
      this.playInfo.time -= 1;
      this.room.sendDataToUsers(this.playInfo.time, ReservedEventName.TIMEOUT);
      this.playTimeCountDownTimerId = setTimeout(this.countDownPlayTime.bind(this), 1000);
    } else {
      this.room.sendDataToUsers(undefined, ReservedEventName.PLAY_OVER);
      this.startNextPlay(9000);
    }
  }
  stopCountDownPlayTime() {
    if (this.playTimeCountDownTimerId !== undefined) {
      clearTimeout(this.playTimeCountDownTimerId);
    }
  }

  startNextPlay(waitFor?: number) {
    const mainLogic = () => {
      try {
        const nextDrawer = this.findNextDrawer();
        if (nextDrawer === undefined) {
          this.startNextRound();
        } else {
          // 这一轮还没结束, 开始新的一场，刷新信息
          this.numOfRightGuesser = 0;
          this.newestDrawing = undefined;
          this.playInfo = {
            keyword: createKeyword(DataService.getRandomGameKeyword()),
            currentPlayer: nextDrawer,
            time: this.room.gameTime,
          };

          this.sendChatting(
            new ChattingMessage(`本场结束，接下来由${nextDrawer.username}作画了`),
          );
          this.room.sendDataToUsers(
            { game: this },
            ReservedEventName.CHANGE_DRAWER,
          );
          this.startCountDownPlayTime();
        }
      } catch (err) {
        // 表示全员离线
        logError(err);
      }
    };
    if (waitFor === undefined) mainLogic();
    else {
      setTimeout(mainLogic, waitFor);
    }
  }

  toJSON(): IGame {
    return {
      userScores: this.userScores,
      users: this.users.map(u => u.toJSON()),
      gameTime: this.gameTime,
      newestDrawing: this.newestDrawing,
      playInfo: this.playInfo,
    };
  }
}
