import RoomService from './RoomService';
import { TGlobalMaps } from '..';
import DataService from './DataService';
import UserService from './UserService';

export default class GameService {
  playTimes = this.room.playTimes;
  gameTime = this.room.gameTime;
  players: {
    [playerId: string]: UserService;
  } = {};
  // userDraw = [];
  countScore = {};
  currentTimes = 1;
  newestDrawing: string | null = null;
  playInfo = {
    keyword: DataService.getRandomGameKeyword(),
    currentPlayer: this.users[0],
    time: this.room.gameTime,
  };
  get users() {
    return this.room.getUserArray();
  }
  constructor(private room: RoomService, private globalMaps: TGlobalMaps) {
    globalMaps.gameMap.set(room.id, this);
  }

  toJSON() {
    return {
      users: this.users,
      playTimes: this.playTimes,
      gameTime: this.gameTime,
      players: this.players,
      newestDrawing: this.newestDrawing,
      // userDraw: this.userDraw,
      countScore: this.countScore,
      currentTimes: this.currentTimes,
      playInfo: this.playInfo,
    };
  }
}
