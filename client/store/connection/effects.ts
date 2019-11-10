import { TReduxThunk } from '../effects';


export function foo(loginStatus?: {
  username: string;
  password: string;
}): TReduxThunk {
  return async (dispatch, getState) => {

  };
}
