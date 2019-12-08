import { IUser } from 'shared/types';
import { produce } from 'immer';

import { IAction } from '../actions';
import { userActionTypes } from '../actionTypes';

export interface IReduxUserState {
  isLogining: boolean;
  user: null | IUser;
  isRegistering: boolean;
}

const defaultState: IReduxUserState = {
  isLogining: false,
  user: null,
  isRegistering: false,
};

export default function userReducer(state = defaultState, action: IAction) {
  return produce(state, draft => {
    const { type, payload } = action;
    switch (type) {
      case userActionTypes.SET_USERNAME:
        if (draft.user != null) {
          draft.user.username = payload as string;
        }
        break;
      case userActionTypes.SET_USER:
        draft.user = payload as IUser;
        break;
      case userActionTypes.SET_IS_GAMING:
        if (draft.user != null) {
          draft.user.isGaming = payload as boolean;
        }
        break;
      case userActionTypes.SET_IS_READY:
        if (draft.user != null) {
          draft.user.isReady = payload as boolean;
        }
        break;

      case userActionTypes.SET_USER_CURRENT_ROOM_ID:
        if (draft.user != null) {
          draft.user.currentRoomId = payload as number | undefined;
        }
        break;
    }
  });
}
