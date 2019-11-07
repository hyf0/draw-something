import { push } from 'connected-react-router';
import { batch as batchDispatch } from 'react-redux';
import { replace } from 'connected-react-router';

import { TReduxThunk } from '../effects';
import { roomActions, userActions, globalActions } from '../actions';
import { RoomType, RoomStatus } from '../../util/constants';
import { IRoom, IPlayer, IGame } from '../../model/types';
import Notification, { NotificationType } from '@/model/Notification';

export function getRoomList(): TReduxThunk {
  return async (dispatch, getState) => {
    const {
      connection: { wsClient },
    } = getState();
    try {
      const respMsg = await wsClient.request('roomList');
      const result = respMsg.data as any[];
      dispatch(roomActions.createSetRoomList(result));
    } catch (err) {
      console.error(err);
    }
  };
}

let isEnteringRoom = false;
export function enterRoom(roomId: number): TReduxThunk {
  return async (dispatch, getState) => {
    if (isEnteringRoom) return;
    isEnteringRoom = true;
    const {
      connection: { wsClient },
    } = getState();
    try {
      const respMsg = await wsClient.request('userEnter', {
        id: roomId,
      });

      const { room, user } = respMsg.data as {
        room: IRoom;
        user: IPlayer;
      };
      batchDispatch(() => {
        dispatch(roomActions.createSetRoom(room));
        dispatch(userActions.createSetUserCurrentRoomId(user.currentRoomId));
        dispatch(push(`/room/${room.id}`));
      });
    } catch (err) {
      dispatch(push('/'));
      console.error(err);
    } finally {
      isEnteringRoom = false;
    }
  };
}

export function leaveRoom(): TReduxThunk {
  return async (dispatch, getState) => {
    const {
      connection: { wsClient },
      user: { user },
    } = getState();
    if (user == null || user.currentRoomId == null) return;
    try {
      wsClient.request('userLeave');
      dispatch(userActions.createSetUserCurrentRoomId(null));
      dispatch(roomActions.createSetRoom(null));
      dispatch(push('/'));
    } catch (err) {
      console.error(err);
    }
  };
}

export function createRoom(name: string, type: RoomType): TReduxThunk {
  return async (dispatch, getState) => {
    const {
      connection: { wsClient },
    } = getState();
    try {
      const respMsg = await wsClient.request('createRoom', {
        name,
        type,
      });
      const room = respMsg.data as IRoom;
      dispatch(enterRoom(room.id));
      // dispatch(getRoomList());
    } catch (err) {
      console.error(err);
    }
  };
}

export function sendChatMessage(content: string): TReduxThunk {
  return async (dispatch, getState) => {
    const {
      connection: { wsClient },
    } = getState();
    try {
      wsClient.request('sendChatMessage', { content });
    } catch (err) {
      console.error(err);
    }
  };
}

export function makeGameIsReady(ready: boolean): TReduxThunk {
  const requestType = ready ? 'makeGameReady' : 'cancelGameReady';
  return async (dispatch, getState) => {
    const {
      connection: { wsClient },
    } = getState();
    try {
      const respMsg = await wsClient.request(requestType);
      const { user, room } = respMsg.data as {
        user: IPlayer;
        room: IRoom;
      };
      dispatch(roomActions.createSetCurrentRoomUsers(room.users));
      dispatch(userActions.createSetIsReady(user.isReady));
    } catch (err) {
      console.error(err);
    }
  };
}

export function getGame(): TReduxThunk {
  return async (dispatch, getState) => {
    const {
      connection: { wsClient },
      user: { user },
    } = getState();
    try {
      const respMsg = await wsClient.request('getGame');
      const { game } = respMsg.data as {
        user: IPlayer;
        game: IGame;
      };
      dispatch(roomActions.createSetCurrentGame(game));
      dispatch(roomActions.createSetCurrentRoomStatus(RoomStatus.GAMING));
    } catch (err) {
      dispatch(
        globalActions.createAddNotification(
          new Notification(err.title, undefined, NotificationType.ERROR),
        ),
      );
      if (user != null && user.currentRoomId != null) {
        dispatch(replace(`/room/${user.currentRoomId}`));
      } else {
        dispatch(replace('/'));
      }
    }
  };
}
