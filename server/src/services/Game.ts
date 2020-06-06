import { EventEmitter } from 'events';

import { ReservedEventName } from '../../../client/src/types/constants';
import { RoomStatus } from '../../../client/src/types/constants';
import ChattingMessage from '../../../client/src/types/models/ChattingMessage';
import ResponseMessage from '../../../client/src/types/models/ResponseMessage';
import { IGame } from '../../../client/src/types/service';

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
  users: User[];
  playInfo: {
    keyword: {
      raw: string;
      hint: string;
    };
    drawer: User;
    time: number;
  };

  // 每一次play和每一轮都会更改的

  nextGuesserIndex = 1; // 这里是1，是因为开始游戏已经算一场play了

  scoreForCurrentDrawer = 2; // 每次有人才对，绘画者加2分

  static create(room: Room) {
    return new Game(room);
  }

  private constructor(private room: Room) {
    super();
    this.users = room.users;
    this.playInfo = {
      keyword: createKeyword(DataService.getRandomGameKeyword()),
      drawer: this.users[0],
      time: this.room.gameTime,
    };
    this.rounds = Math.max(room.rounds, 1); // 最少一轮
    room.users.forEach(u => {
      this.userScores[u.id] = 0;
    });
  }

  start() {
    this.room.status = RoomStatus.GAMING;
    const roomUsers = this.room.users;
    this.startCountDownPlayTime();

    roomUsers.forEach(user => {
      user.isGaming = true;
      user.isReady = false;
      this.room.sendDataToUsers(
        { user, game: this },
        ReservedEventName.START_GAME,
      );
    });
  }


  tryStartNextPlay(timeout?: number) {
    const mainLogic = () => {
      const users = this.users;
      const isThisRoundOver = this.nextGuesserIndex === users.length;
      if (isThisRoundOver) {
        this.rounds -= 1;
        if (this.rounds === 0) {
          this.sendGameOver();
          return; // 游戏结束，直接断掉
        }
        // 更新每一轮round相关的变量
        this.nextGuesserIndex = 0;
      }
      // 更新每一场play相关的变量
      const nextDrawer = users[this.nextGuesserIndex];
      this.nextGuesserIndex += 1;
      this.numOfRightGuesser = 0;
      this.scoreForNextGuessRight = 4;
      this.newestDrawing = undefined;
      this.playInfo = {
        keyword: createKeyword(DataService.getRandomGameKeyword()),
        drawer: nextDrawer,
        time: this.room.gameTime,
      };
      this.room.sendDataToUsers({ game: this }, ReservedEventName.CHANGE_DRAWER);
      this.sendChatting(
        new ChattingMessage(
          `现在由 ${nextDrawer.username} 作画`,
        ),
      );
      this.startCountDownPlayTime();
    };
    if (timeout === undefined) mainLogic();
    else setTimeout(mainLogic, timeout);
  }

  countScore(rightGuesser: User) {
    const { drawer } = this.playInfo;
    this.userScores[rightGuesser.id] += this.scoreForNextGuessRight;
    this.userScores[drawer.id] += this.scoreForCurrentDrawer;
    this.sendChatting(
      new ChattingMessage(
        `${rightGuesser.username} 猜对了, 加${this.scoreForNextGuessRight}分`,
      ),
    );
    this.room.sendDataToUsers({ game: this }, ReservedEventName.REFRESH_GAME); // 更新分数
    this.scoreForNextGuessRight = Math.max(
      1,
      this.scoreForNextGuessRight - 1,
    ); // 保证scoreForNextGuessRight最小值为 1
  }

  takeGuess(guessAnswer: string, guesser: User) {
    const rightAnswer = this.playInfo.keyword.raw;
    if (rightAnswer === guessAnswer) {
      this.countScore(guesser);

      this.numOfRightGuesser += 1;
      const isAllGuessRight = this.numOfRightGuesser === this.users.length - 1;
      if (isAllGuessRight) {
        this.sendPlayOver();
        this.stopCountDownPlayTime();
        this.tryStartNextPlay(8000);
      }
    } else {
      this.sendChatting(
        new ChattingMessage(guessAnswer, {
          name: guesser.username,
          id: guesser.id,
        }),
      );
    }
  }

  refreshGameUsers = () => {
    this.room.sendDataToUsers(
      this.users,
      ReservedEventName.REFRESH_GAME_USERS,
    );
  };

  sendPlayOver() {
    this.stopCountDownPlayTime();
    this.room.sendDataToUsers(
      { answer: this.playInfo.keyword.raw },
      ReservedEventName.PLAY_OVER,
    );
  }

  sendGameOver() {
    this.emit('delete');
    this.room.status = RoomStatus.WAITING;
    this.room.users.forEach(u => {
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


  sendChatting(chat: ChattingMessage) {
    this.room.sendDataToUsers(chat, ReservedEventName.GAME_CHATTING);
  }


  playTimeCountDownTimerId: undefined | NodeJS.Timeout;
  startCountDownPlayTime() {
    if (this.playTimeCountDownTimerId !== undefined) {
      clearTimeout(this.playTimeCountDownTimerId);
    }
    this.playTimeCountDownTimerId = setTimeout(
      this.countDownPlayTime.bind(this),
      1000,
    );
  }
  countDownPlayTime() {
    let oldTime = this.playInfo.time;
    if (oldTime > 0) {
      this.playInfo.time -= 1;
      this.room.sendDataToUsers(this.playInfo.time, ReservedEventName.TIMEOUT);
      this.playTimeCountDownTimerId = setTimeout(
        this.countDownPlayTime.bind(this),
        1000,
      );
    } else {
      this.sendPlayOver();
      this.tryStartNextPlay(8000);
    }
  }
  stopCountDownPlayTime() {
    if (this.playTimeCountDownTimerId !== undefined) {
      clearTimeout(this.playTimeCountDownTimerId);
    }
  }


  toJSON(): IGame {
    return {
      userScores: this.userScores,
      users: this.users.map(u => u.toJSON()),
      newestDrawing: this.newestDrawing,
      playInfo: this.playInfo,
    };
  }
}
