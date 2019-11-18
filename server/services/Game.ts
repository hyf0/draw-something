import DataService from './DataService';
import { TGlobals } from '../globals';
import Room from './Room';
import { IGame } from '@shared/types';
import User from './User';
import { RoomStatus } from '@shared/constants/room';

function createKeyword(arg: [string, string]) {
  return {
    raw: arg[0],
    hint: arg[1],
  };
}

export default class Game {
  playTimes = this.room.playTimes;
  // userDraw = [];
  userScores: {
    [userId: string]: number;
  } = {};
  currentTimes = 1;
  newestDrawing: string | undefined;

  // 每一轮会更改的

  rounds = 2; // 还剩几轮游戏, 这里默认写了三轮，到后期，应该是可以根据创建房间时的参数调节

  // 每一次play会更改的

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
  gameTime = this.room.gameTime; // 游戏时间，每个玩家画画和猜测的时间
  offLineUserIdSet = new Set<string>();

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
    return this.rounds < 0;  // rounds 表示的还剩多少轮，等于0表示没有下一轮了，但不表示游戏已经结束
  }

  get isPlayOver() {
    // 一个是除了画家的玩家都猜对了，一个是到游戏到时间了
    return (
      this.isOverTime || this.numOfRightGuesser >= this.onLineUsers.length - 1
    );
  }

  constructor(private room: Room, private globals: TGlobals) {
    globals.gameMap.set(room.id, this);
    room.users.forEach(u => {
      this.userScores[u.id] = 0;
    });

    this.startNextRound();
  }

  gameOver() {
    this.users.forEach(u => {
      u.isGaming = false;
    });
    this.room.status = RoomStatus.WAITING;
    this.globals.gameMap.delete(this.room.id);
  }

  findNextGuesser() {
    while (this.nextGuesserIndex < this.users.length) {
      const guesser = this.users[this.nextGuesserIndex];
      this.nextGuesserIndex += 1;
      const isOffLine = this.offLineUserIdSet.has(guesser.id);
      if (!isOffLine) return guesser;
    }
    return undefined;
  }

  takeGuess(guessAnswer: string, guesser: User) {
    if (this.playInfo.keyword.raw === guessAnswer) {
      this.numOfRightGuesser += 1;

      this.userScores[guesser.id] += 1;

      return true;
    }
    return false;
  }

  private startNextRound() {
    this.rounds -= 1;
    console.log('新一轮游戏 剩余', this.rounds);
    if (this.rounds < 0) {
      this.gameOver();
      return;
    }

    this.nextGuesserIndex = 0;

    this.startNextPlay();
  }

  startNextPlay() {

    const nextGuesser = this.findNextGuesser();
    if (this.nextGuesserIndex === 0 && nextGuesser === undefined) {
      // 全员恶人！不对，是全员离线，建议直接删除本次游戏。
    } else if (nextGuesser === undefined) { // isThisRoundOver，这一轮游戏是不是到头了
      this.startNextRound();
    } else {
      // 没到头
      this.numOfRightGuesser = 0;
      this.isOverTime = false; // 重置超时判断
      this.playInfo = {
        keyword: createKeyword(DataService.getRandomGameKeyword()),
        currentPlayer: nextGuesser,
        time: this.room.gameTime,
      };
    }
  }

  toJSON(): IGame {
    return {
      userScores: this.userScores,
      users: this.users.map(u => u.toJSON()),
      playTimes: this.playTimes,
      gameTime: this.gameTime,
      newestDrawing: this.newestDrawing,
      currentTimes: this.currentTimes,
      playInfo: this.playInfo,
    };
  }
}
