import { produce } from 'immer';

import { IAction } from '../actions';
import WebsocketClient from '../../WebsocketClient';
import config from '../../config';
import { userEffects } from '../effects';
import { store } from '../../App';

export interface IReduxConnectionState {
  wsClient: WebsocketClient;
}

const defaultState: IReduxConnectionState = {
  wsClient: new WebsocketClient({
    addr: config.addr,
    onopen: () => {
      console.log('服务器已连接');
      store.dispatch(userEffects.login() as any);
    },
  }),
};

export default function connectionReducer(state = defaultState, action: IAction) {
  return produce(state, () => {
    const { type } = action;
    switch (type) {

    }
  });
}
