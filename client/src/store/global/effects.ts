import { TReduxThunk } from '../effects';
import { globalActions } from '../actions';
import wsClient from '@/WebsocketClient/wsClient';


export function getNumberOfOnlinePlayer(): TReduxThunk {
  return async dispatch => {
    try {
      const result = (await wsClient.request('numberOfOnlineUser')).data as number;
      dispatch(globalActions.createSetNumberOfOnlinePlayer(result));
    } catch (err) {
      console.error(err);
    }
  };
}
