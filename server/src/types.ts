import { TGlobalMaps } from ".";
import NodeWebsocket from 'ws';
import UserService from "./services/UserService";
import RoomService from "./services/RoomService";
import GameService from "./services/GameService";
import RequestMessage from "./models/RequestMessage";

export interface IMessage {
  type: string;
  id?: string;
  error?: boolean;
  desc?: string; // message的说明信息，用于前端出错说明，一般会在error的时候赋值
  data?: unknown;
}

export interface IControllerContext {
  message: RequestMessage;
  globalMaps: TGlobalMaps;
  user: UserService,
  room: null | RoomService,
  game: null | GameService,
  ws: NodeWebsocket;
  sendRespData: (data: any) => void;
  sendRespError: (title: string, detail?: string) => void;
}
