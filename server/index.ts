// import 'module-alias/register'; // 用于解决ts编译器不编译alias的问题
import NodeWebsocket from 'ws';

import { serverConfig } from './config';
import Connection from './controllers/Connection';
import globals from './globals';
import { IS_DEV_SERVER } from './util/contants';
import { log } from './util/helper';



if (IS_DEV_SERVER) {
  log('正处于开发模式中');
}

const wss = new NodeWebsocket.Server(
  {
    port: serverConfig.port,
  },
  () => {
    log(
      `draw something websocket server is started in ${wss.path ? wss.path : '/'}:${serverConfig.port}`,
    );
  },
);

wss.on('connection', ws => {
  // new ConnectionController(ws, globalMaps);
  new Connection(ws, globals);
});
