import UserController from "./UserController";
import { IControllerContext } from "../types";
import RoomConroller from "./RoomController";
import GameController from "./GameController";

const controllers: {
  [key: string]: (ctx: IControllerContext, ...args: unknown[]) => void;
} = {
  login: UserController.login,
  numberOfOnlinePlayer: UserController.numberOfOnlinePlayer,
  changeUsername: UserController.changeUsername,
  roomList: RoomConroller.roomList,
  createRoom: RoomConroller.createRoom,
  playerEnter: RoomConroller.playerEnter,
  playerLeave: RoomConroller.playerLeave,
  sendChatMessage: RoomConroller.sendChatMessage,
  makeGameReady: RoomConroller.makeGameReady,
  cancelGameReady: RoomConroller.cancelGameReady,
  getGame: GameController.getGame,
  drawAction: GameController.drawAction,
}

export default controllers;

