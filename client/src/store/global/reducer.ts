import { produce } from 'immer';

import { IAction } from '../actions';
import { globalActionTypes } from '../actionTypes';
import Notification, { NotificationType } from '@/model/Notification';

export interface IReduxGlobalState {
  numberOfOnlinePlayer: number;
  notifications: Notification[];
}

const defaultState: IReduxGlobalState = {
  numberOfOnlinePlayer: 1,
  notifications: [],
};

export default function globalReducer(state = defaultState, action: IAction) {
  return produce(state, draft => {
    const { type, payload } = action;
    switch (type) {
      case globalActionTypes.SET_NUMBER_OF_ONLINE_PLAYER:
        draft.numberOfOnlinePlayer = payload as number;
        break;
      case globalActionTypes.ADD_NOTIFICATION:
        draft.notifications.push(payload as Notification);
        break;
      case globalActionTypes.SHIFT_NOTIFICATION:
        draft.notifications.shift();
        break;
    }
  });
}
