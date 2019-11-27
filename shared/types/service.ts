import { RoomStatus, RoomType } from '../constants/room';

export interface IUser {
  token: string;
  id: string;
  currentRoomId: number | undefined;
  isGaming: boolean;
  isDeleted: boolean;
  isOnLine: boolean;
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
  gameTime: number,
  userScores: {
    [userId: string]: number,
  },
  newestDrawing: string | undefined;
  // userDraw: string,
  playInfo: {
    keyword: {
      raw: string;
      hint: string;
    };
    drawer: IUser;
    time: number;
  },
}
