import { IAction } from '../actions';
import { roomActionTypes } from '../actionTypes';
import { IRoom, IUser, IGame } from '@shared/types';
import { RoomStatus } from '@shared/constants/room';

export function createSetRoomList(roomList: any[]): IAction {
  return {
    type: roomActionTypes.SET_ROOM_LIST,
    payload: roomList,
  };
}

export function createSetCurrentRoomUsers(users: IUser[]): IAction {
  return {
    type: roomActionTypes.SET_CURRENT_ROOM_USERS,
    payload: users,
  };
}

export function createSetRoom(r: IRoom | null): IAction {
  return {
    type: roomActionTypes.SET_ROOM,
    payload: r,
  };
}

export function createSetCurrentGame(g: IGame | null): IAction {
  return {
    type: roomActionTypes.SET_CURRENT_GAME,
    payload: g,
  };
}

export function createSetCurrentRoomStatus(s: RoomStatus): IAction {
  return {
    type: roomActionTypes.SET_CURRENT_ROOM_STATUS,
    payload: s,
  }
}
