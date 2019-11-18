import NodeWebsocket from 'ws';
import { IS_DEV } from './util/contants';
import { serverConfig } from './config';

import Connection from './controllers/Connection';
import globals from './globals';
import { log } from './util/helper';

if (IS_DEV) {
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
