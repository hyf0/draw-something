import './index.scss';

import {
  Button,
  IconButton,
  List,
  ListItem,
  ListSubheader,
} from '@material-ui/core';
import { LoopOutlined as FreshIcon } from '@material-ui/icons';

import { roomActions } from '@client/store/actions';
import { roomEffects } from '@client/store/effects';
import { IReduxState } from '@client/store/reducers';
import { IS_DEV_CLIENT } from '@client/util/constants';
import { push } from 'connected-react-router';
import React, { useCallback, useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { IRoom } from '../../../../../shared/types';
import { RoomStatus } from '../../../../../shared/constants/room';

const statusText = {
  [RoomStatus.GAMING]: '游戏中',
  [RoomStatus.WAITING]: '等待中',
};

function RoomListItem({ room }: { room: IRoom }) {
  const dispatch = useDispatch();
  return (
      <div className="room-list-room">
        <div className="room-name">{room.name}</div>
        <div className="room-info">
          <div className="room-number">
            No.{String(room.id).padStart(5, '0')}
          </div>
          <div className="room-status">{statusText[room.status]}</div>
        </div>
        <div className="room-actions">
          <Button
            onClick={() => dispatch(push(`/room/${room.id}`))}
            fullWidth
            variant="outlined"
          >
            加入房间
          </Button>
        </div>
      </div>
  );
}

const selectorRoomList = ({
  room: { roomList },
  connection: { wsClient },
}: IReduxState) => ({
  roomList,
  wsClient,
});

export default function RoomList() {
  if (IS_DEV_CLIENT) {
    console.log('render RoomList');
  }

  const { roomList, wsClient } = useSelector(selectorRoomList, shallowEqual);

  const dispatch = useDispatch();
  const freshRoomList = useCallback(() => {
    dispatch(roomEffects.getRoomList());
  }, [dispatch]);

  useEffect(() => {
    freshRoomList();

    const refreshRoomListOff = wsClient.on('refreshRoomList', respData => {
      const roomList = respData as IRoom[];
      dispatch(roomActions.createSetRoomList(roomList));
    });

    return () => {
      refreshRoomListOff();
    };
  }, [dispatch, freshRoomList, wsClient]);

  return (
    <div className="room-list">
      <List
        subheader={
          <ListSubheader>
            房间列表
            <IconButton onClick={freshRoomList}>
              <FreshIcon />
            </IconButton>
          </ListSubheader>
        }
        className="room-list"
      >
        {roomList.length === 0 ? (
          <div className="no-room-text">暂无公开房间</div>
        ) : (
          <div className="room-list-content">
            {roomList.map(room => (
              <RoomListItem key={room.id} room={room} />
            ))}
          </div>
        )}
      </List>
    </div>
  );
}
