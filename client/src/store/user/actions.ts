import { IAction } from '../actions';
import { userActionTypes } from '../actionTypes';
import { IUser } from 'shared/types';

export function createSetUsername(username: string): IAction {
  return {
    type: userActionTypes.SET_USERNAME,
    payload: username,
  };
}

export function createSetUser(user: IUser): IAction {
  return {
    type: userActionTypes.SET_USER,
    payload: user,
  };
}

export function createSetIsGaming(status: boolean): IAction {
  return {
    type: userActionTypes.SET_IS_GAMING,
    payload: status,
  }
}

export function createSetUserCurrentRoomId(rid: number | undefined): IAction {
  return {
    type: userActionTypes.SET_USER_CURRENT_ROOM_ID,
    payload: rid,
  }
}

export function createSetIsReady(status: boolean): IAction {
  return {
    type: userActionTypes.SET_IS_READY,
    payload: status,
  }
}
