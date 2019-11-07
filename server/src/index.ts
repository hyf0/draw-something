import NodeWebsocket from 'ws';
import { IS_DEV } from './util/contants';
import { serverConfig } from './config';
import RoomService from './services/RoomService';
import UserService from './services/UserService';
import GameService from './services/GameService';
import Connection from './controllers/Connection';
import globals from './globals';

if (IS_DEV) {
  console.log('正处于开发模式中');
}

const globalMaps = {
  userMap: new Map<string, UserService>(),
  roomMap: new Map<number, RoomService>(),
  gameMap:  new Map<number, GameService>(),
};

export type TGlobalMaps = typeof globalMaps;

// ws server

const wss = new NodeWebsocket.Server(
  {
    port: serverConfig.port,
  },
  () => {
    console.log(
      `draw something websocket server is started in ${wss.path ? wss.path : '/'}:${serverConfig.port}`,
    );
  },
);

wss.on('connection', ws => {
  // new ConnectionController(ws, globalMaps);
  new Connection(ws, globals);
});
