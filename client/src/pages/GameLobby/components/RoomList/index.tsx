import './index.scss';

import { roomActions } from '@/store/actions';
import { roomEffects } from '@/store/effects';
import { IReduxState } from '@/store/reducers';
import wsClient from '@/WebsocketClient/wsClient';
import { Button, IconButton, List, ListSubheader } from '@material-ui/core';
import { LoopOutlined as FreshIcon } from '@material-ui/icons';
import { push } from 'connected-react-router';
import React, { useCallback, useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { RoomStatus } from '@/types/constants/room';
import { IRoom } from '@/types/service';

const statusText = {
  [RoomStatus.GAMING]: '游戏中',
  [RoomStatus.WAITING]: '等待中...',
};

function RoomListItem({ room }: { room: IRoom }) {
  const dispatch = useDispatch();
  return (
    <div className="room-list-room">
      <div className="room-info">
        <div className="room-name">{room.name}</div>
        <div className="room-number">No.{String(room.id).padStart(5, '0')}</div>
      </div>
      <div className="room-actions">
        <div className="room-status">{statusText[room.status]}</div>
        <Button
          onClick={() => dispatch(push(`/room/${room.id}`))}
          style={{ boxShadow: 'none' }}
          fullWidth
          variant="contained"
          color="primary"
        >
          加入{`(${room.users.length}/${room.maxPlayerNumber})`}
        </Button>
      </div>
    </div>
  );
}

const selectorRoomList = ({
  room: { roomList },
}: IReduxState) => ({
  roomList,
});

export default function RoomList() {
  const { roomList } = useSelector(selectorRoomList, shallowEqual);

  const dispatch = useDispatch();
  const freshRoomList = useCallback(() => {
    dispatch(roomEffects.getRoomList());
  }, [dispatch]);

  useEffect(() => {
    freshRoomList();

    const refreshRoomListOff = wsClient.listen('refreshRoomList', respData => {
      const roomList = respData as IRoom[];
      dispatch(roomActions.createSetRoomList(roomList));
    });

    return () => {
      refreshRoomListOff();
    };
  }, [dispatch, freshRoomList]);

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
