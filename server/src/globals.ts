
import GameService from "./services/GameService";
import User from "./services/User";
import Room from "./services/Room";
import Game from "./services/Game";

const globals = {
  sesstionUserMap: new Map<string, User>(), // key:user.token 而非 user.id
  userMap: new Map<string, User>(),  // key:user.id
  roomMap: new Map<number, Room>(),
  gameMap:  new Map<number, Game>(),
}

export type TGlobals = typeof globals;

export default globals;
