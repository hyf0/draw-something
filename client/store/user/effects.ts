import { TReduxThunk } from '../effects';
import { userActions } from '../actions';
import { getToken, setToken } from '../../util/helper';
import API from '@client/API';

export function login(): TReduxThunk {
  return async dispatch => {
    const token = getToken();
    const user = await API.user.login(token);
    setToken(user.token);
    dispatch(userActions.createSetUser(user));
  };
}

export function changeUsername(usrName: string): TReduxThunk {
  return async dispatch => {
    const changed = await API.user.changeUsername(usrName);
    dispatch(userActions.createSetUsername(changed));
  };
}
