import { EventEmitter } from 'events';

import { ReservedEventName } from '../../shared/constants';
import { RoomStatus } from '../../shared/constants/room';
import ChattingMessage from '../../shared/models/ChattingMessage';
import ResponseMessage from '../../shared/models/ResponseMessage';
import { IGame } from '../../shared/types';
import globals from '../globals';
import { logError } from '../util/helper';
import DataService from './DataService';
import Room from './Room';
import SenderService from './SenderService';
import User from './User';

// play 场，每个人画的时候算一场
// round 轮，每个人都画了一次算一轮

function createKeyword(arg: [string, string]) {
  return {
    raw: arg[0],
    hint: arg[1],
  };
}

export default class Game extends EventEmitter {
  userScores: {
    [userId: string]: number;
  } = {};

  // 每一轮会更改的

  rounds: number; // 还剩几轮游戏, 这里默认写了1轮，到后期，应该是可以根据创建房间时的参数调节

  // 每一次play会更改的
  newestDrawing: string | undefined; // 当前游戏的最新画面，用于断线重连
  scoreForNextGuessRight = 4; // 第一个猜对的人4分，依次递减，最低1分
  numOfRightGuesser = 0;
  isOverTime = false;
  playInfo = {
    keyword: createKeyword(DataService.getRandomGameKeyword()),
    drawer: this.users[0],
    time: this.room.gameTime,
  };

  // 每一次play和每一轮都会更改的

  nextGuesserIndex = 0;

  gameTime: number; // 每一场的游戏时间
  scoreForCurrentDrawer = 2; // 每次有人才对，绘画者加2分

  get users() {
    return this.room.users;
  }

  get isGameOver() {
    return this.rounds < 0; // rounds 表示的还剩多少轮，等于0表示没有下一轮了，但不表示游戏已经结束
  }
  get isPlayOver() { // 除了画家的玩家

    const users = this.users;
    return this.numOfRightGuesser >= users.length - 1;
  }

  static create(room: Room) {
    const aGame = new Game(room);
    globals.gameMap.set(room.id, aGame);
    const users = room.users;
    users.forEach(u => {
      u.on('offLine', () => aGame.refreshGameUsers('offLine'));
      u.on('reuse', () => aGame.refreshGameUsers('reuse'));
    });
    aGame.once('delete', () => {
      users.forEach(u => {
        u.off('offLine', aGame.refreshGameUsers);
        u.off('reuse', aGame.refreshGameUsers);
      });
    });

    return aGame;
  }

  private constructor(private room: Room) {
    super();
    this.rounds = room.rounds;
    this.gameTime = room.gameTime;
    room.users.forEach(u => {
      this.userScores[u.id] = 0;
    });
    this.startNextRound(true);
  }

  refreshGameUsers = (desc?: string) => {
    this.room.sendDataToUsers(this.users, ReservedEventName.REFRESH_GAME_USERS, desc);
  }

  sendPlayOver() {
    this.room.sendDataToUsers({
      answer: this.playInfo.keyword.raw,
    }, ReservedEventName.PLAY_OVER);
  }

  gameOver() {
    globals.gameMap.delete(this.room.id);
    this.room.status = RoomStatus.WAITING;
    this.users.forEach(u => {
      u.isGaming = false;
      SenderService.send(
        u.ws,
        new ResponseMessage({
          data: { user: u },
          trigger: ReservedEventName.GAME_OVER,
        }),
      );
    });
  }

  findNextDrawer() { // 如果返回 undefined，则说说明一轮过去了
    const users = this.users;
    if (this.nextGuesserIndex >= users.length) {
      return undefined;
    }
    const guesser = users[this.nextGuesserIndex];
    this.nextGuesserIndex += 1;
    return guesser;
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
        this.playInfo.drawer.id
      ] += this.scoreForCurrentDrawer;
      this.room.sendDataToUsers(this, ReservedEventName.REFRESH_GAME);
      this.sendChatting(
        new ChattingMessage(
          `${guesser.username} 猜对了, 加${this.scoreForNextGuessRight}分`,
        ),
      );

      this.numOfRightGuesser += 1;
      if (this.isPlayOver) {
        this.sendPlayOver();
        this.stopCountDownPlayTime();
        this.startNextPlay(9000); // 给前端留出分数结算时间
      }

      // 收尾
      this.scoreForNextGuessRight = Math.max(1, this.scoreForNextGuessRight - 1); // 保证scoreForNextGuessRight最小值为 1

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
      this.sendPlayOver();
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
        } else { // 这一轮还没结束, 开始新的一场，刷新信息
          this.numOfRightGuesser = 0;
          this.newestDrawing = undefined;
          this.playInfo = {
            keyword: createKeyword(DataService.getRandomGameKeyword()),
            drawer: nextDrawer,
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
