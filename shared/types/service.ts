import { RoomStatus, RoomType } from '@shared/constants/room';

export interface IUser {
  token: string;
  id: string;
  currentRoomId: number | undefined;
  isGaming: boolean;
  isOnline: boolean;
  username: string;
  lastActiveTime: number;
  isReady: boolean;
}

export interface IRoom {
  name: string;
  id: number;
  type: RoomType;
  users: IUser[];
  status: RoomStatus;
  maxPlayerNumber: number;
  createAt: number;
  playTimes: number;
  gameTime: number;
}

// users: this.users.map(u => u.toJSON()),
// playTimes: this.playTimes,
// gameTime: this.gameTime,
// newestDrawing: this.newestDrawing,
// // userDraw: this.userDraw,
// countScore: this.countScore,
// currentTimes: this.currentTimes,
// playInfo: this.playInfo,

export interface IGame {
  users: IUser[],
  playTimes: number,
  gameTime: number,
  userScores: {
    [userId: string]: number,
  },
  newestDrawing: string | undefined;
  // userDraw: string,
  currentTimes: number,
  playInfo: {
    keyword: {
      raw: string;
      hint: string;
    };
    currentPlayer: IUser;
    time: number;
  },
}
