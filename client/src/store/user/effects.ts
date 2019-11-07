import { TReduxThunk } from '../effects';
import { userActions } from '../actions';
import { getToken, setToken } from '../../util/helper';
import { IPlayer } from '../../model/types';

export function login(): TReduxThunk {
  return async (dispatch, getState) => {
    const {
      connection: { wsClient },
    } = getState();
    const token = getToken();
    const user = (await wsClient.request('login', token)).data as IPlayer;
    setToken(user.token);
    dispatch(userActions.createSetUser(user));
  };
}

export function startListenRefreshPlayerInfo(): TReduxThunk {
  return async (dispatch, getState) => {
    const {
      connection: { wsClient },
    } = getState();
    wsClient.on('refreshPlayerInfo', msgData => {
      const user = msgData as IPlayer;
      dispatch(userActions.createSetUser(user));
    });
  };
}

export function stopListenRefreshPlayerInfo(): TReduxThunk {
  return async (dispatch, getState) => {
    const {
      connection: { wsClient },
    } = getState();
    wsClient.off('refreshPlayerInfo');
  };
}

export function changeUsername(username: string): TReduxThunk {
  return async (dispatch, getState) => {
    const {
      connection: { wsClient },
    } = getState();
    const changedName = (await wsClient.request(
      'changeUsername',
      username,
    )).data as string;
    dispatch(userActions.createSetUsername(changedName));
  };
}
