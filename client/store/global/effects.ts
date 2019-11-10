import { TReduxThunk } from '../effects';
import { globalActions } from '../actions';


export function getNumberOfOnlinePlayer(): TReduxThunk {
  return async (dispatch, getState) => {
    const { connection: { wsClient } } = getState();
    try {
      const result = (await wsClient.request('numberOfOnlineUser')).data as number;
      dispatch(globalActions.createSetNumberOfOnlinePlayer(result));
    } catch (err) {
      console.error(err);
    }
  };
}
