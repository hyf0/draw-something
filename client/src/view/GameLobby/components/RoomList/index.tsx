import React, { useEffect, useCallback } from 'react';
import {
  List,
  ListItem,
  ListSubheader,
  Button,
  IconButton,
} from '@material-ui/core';
import { LoopOutlined as FreshIcon } from '@material-ui/icons';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { push } from 'connected-react-router';

import { IReduxState } from '@/store/reducers';
import { roomEffects } from '@/store/effects';
import { IS_DEV, RoomStatus } from '@/util/constants';
import { IRoom } from '@/model/types';

import './index.scss';

const selectorRoomList = ({ room: { roomList } }: IReduxState) => ({
  roomList,
});

const statusText = {
  [RoomStatus.GAMING]: '游戏中',
  [RoomStatus.WAITING]: '等待中',
};

function RoomListItem({ room }: { room: IRoom }) {
  const dispatch = useDispatch();
  return (
    <ListItem className="room-list-item-wrapper">
      <div className="room-list-item">
        <div className="room-list-item-header">
          <div className="room-list-item-header-titie">
            房间号: {String(room.id).padStart(5, '0')} - {room.name}
          </div>
          <div className="room-list-item-status">{statusText[room.status]}</div>
        </div>
        <div className="room-list-item-detail">
          <div className="number-of-player">
            玩家人数 {room.users.length} / {room.maxPlayerNumber}
          </div>
          <div className="room-list-item-operations">
            <Button
              onClick={() => dispatch(push(`/room/${room.id}`))}
              className="join-in-button"
              variant="outlined"
            >
              加入房间
            </Button>
          </div>
        </div>
      </div>
    </ListItem>
  );
}

export default function RoomList() {
  if (IS_DEV) {
    console.log('render RoomList');
  }

  const { roomList } = useSelector(selectorRoomList, shallowEqual);

  const dispatch = useDispatch();
  const freshRoomList = useCallback(() => {
    dispatch(roomEffects.getRoomList());
  }, [dispatch]);

  useEffect(() => {
    freshRoomList();
  }, [freshRoomList]);

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
          roomList.map(room => <RoomListItem key={room.id} room={room} />)
        )}
      </List>
    </div>
  );
}
