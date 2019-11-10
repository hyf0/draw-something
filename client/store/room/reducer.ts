import { produce } from 'immer';

import { IAction } from '../actions';
import { roomActionTypes } from '../actionTypes';
import { IRoom, IPlayer, IGame } from '../../model/types';
import { RoomStatus } from '@src/util/constants';

export interface IReduxRoomState {
  roomList: IRoom[];
  currentRoom: null | IRoom;
  currentGame: null | IGame;
}

const defaultState: IReduxRoomState = {
  roomList: [],
  currentRoom: null,
  currentGame: null,
};

export default function roomReducer(state = defaultState, action: IAction) {
  return produce(state, draft => {
    const { type, payload } = action;
    switch (type) {
      case roomActionTypes.SET_ROOM_LIST:
        draft.roomList = payload as IRoom[];
        break;
      case roomActionTypes.SET_CURRENT_ROOM_USERS:
        if (draft.currentRoom != null) {
          draft.currentRoom.users = payload as IPlayer[];
        }
        break;
      case roomActionTypes.SET_ROOM:
        draft.currentRoom = payload as IRoom | null;
        break;
      case roomActionTypes.SET_CURRENT_GAME:
        draft.currentGame = payload as IGame | null;
        break;
      case roomActionTypes.SET_CURRENT_ROOM_STATUS:
        if (draft.currentRoom != null) {
          draft.currentRoom.status = payload as RoomStatus;
        }
        break;
    }
  });
}
