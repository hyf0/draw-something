import { RoomType, RoomStatus } from "../util/constants";

export interface IPlayer {
  token: string;
  id: string;
  currentRoomId: number | null;
  isGaming: boolean;
  isOnline: boolean;
  clearTimerId: number;
  username: string;
  isLogined: boolean;
  lastActiveTime: number;
  isReady: boolean;
}

export interface IRoom {
  name: string;
  id: number;
  type: RoomType;
  users: IPlayer[];
  status: RoomStatus;
  maxPlayerNumber: number;
  createAt: number;
  playTimes: number;
  gameTime: number;
}

export interface IChattingMessage {
  id: string;
  speaker: {
    name: string;
    id: string;
  }
  content: string;
  timestamp: number;
}

export interface IGame {
  users: IPlayer[],
  playTimes: number,
  gameTime: number,
  userScore: {
    [playerId: string]: number,
  },
  newestDrawing: string | undefined;
  // userDraw: string,
  countScore: number,
  currentTimes: number,
  playInfo: {
    keyword: [string, string];
    currentPlayer: IPlayer;
    time: number;
  },
}
