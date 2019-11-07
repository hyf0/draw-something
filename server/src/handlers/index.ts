import UserHandler from "./UserHandler";
import HandlerContext from "../models/HandlerContext";
import RoomHandler from "./RoomHandler";
import GameHandler from "./GameHander";

const handlers: {
  [handlerName: string]: (ctx: HandlerContext) => void;
} = {
  login: UserHandler.login,
  numberOfOnlineUser: UserHandler.numberOfOnlineUser,
  changeUsername: UserHandler.changeUsername,
  roomList: RoomHandler.roomList,
  createRoom: RoomHandler.createRoom,
  userEnter: RoomHandler.userEnter,
  userLeave: RoomHandler.userLeave,
  makeGameReady: RoomHandler.makeGameReady,
  cancelGameReady: RoomHandler.cancelGameReady,
  sendChatMessage: RoomHandler.sendChatMessage,
  getGame: GameHandler.getGame,
  drawAction: GameHandler.drawAction,
}

export default handlers;
