import { IAction } from '../actions';
import { globalActionTypes } from '../actionTypes';
import Notification from '@/model/Notification';

export function createSetNumberOfOnlinePlayer(num: number): IAction {
  return {
    type: globalActionTypes.SET_NUMBER_OF_ONLINE_PLAYER,
    payload: num,
  };
}

export const createAddNotification = (n: Notification) => ({
  type: globalActionTypes.ADD_NOTIFICATION,
  payload: n,
});

export const createShiftNotification = () => ({
  type: globalActionTypes.SHIFT_NOTIFICATION,
});
