import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router'
import { Location } from 'history';

import userReducer, { IReduxUserState } from "./user/reducer";
import connectionReducer, { IReduxConnectionState } from "./connection/reducer";
import globalReducer, { IReduxGlobalState } from "./global/reducer";
import roomReducer, { IReduxRoomState } from "./room/reducer";

const reducers = {
  user: userReducer,
  connection: connectionReducer,
  global: globalReducer,
  room: roomReducer,
}

const createRootReducer = (history: any) => combineReducers({
  router: connectRouter(history),
  ...reducers,
});

export default createRootReducer;

export interface IReduxState {
    user: IReduxUserState,
    connection: IReduxConnectionState,
    global: IReduxGlobalState,
    room: IReduxRoomState,
    router: {
      location: Location,
    }
}
