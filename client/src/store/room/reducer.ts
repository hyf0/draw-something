import { produce } from 'immer';

import { RoomStatus } from '@/types/constants';
import { IGame, IRoom, IUser } from '@/types/service';
import { IAction } from '../actions';
import { roomActionTypes } from '../actionTypes';


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
          draft.currentRoom.users = payload as IUser[];
        }
        break;
      case roomActionTypes.SET_ROOM:
        draft.currentRoom = payload as IRoom | null;
        break;
      case roomActionTypes.SET_CURRENT_GAME:
        draft.currentGame = payload as IGame | null;
        break;
      case roomActionTypes.SET_CURRENT_GAME_USERS:
        if (draft.currentGame != undefined) {
          draft.currentGame.users = payload as IUser[];
        }
        break;
      case roomActionTypes.SET_CURRENT_ROOM_STATUS:
        if (draft.currentRoom != null) {
          draft.currentRoom.status = payload as RoomStatus;
        }
        break;
    }
  });
}
