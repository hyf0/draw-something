import { useDocumentTitle } from '@/hooks';
import { roomEffects } from '@/store/effects';
import { IReduxState } from '@/store/reducers';
import { AppBar, Button, Toolbar, Typography } from '@material-ui/core';
import { ArrowBackOutlined as BackIcon } from '@material-ui/icons';
import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { RoomType } from '@/types/constants';

// import { IGame, IRoom, IUser } from '@/types/service';

const selectorPlayingRoom = ({ room: { currentRoom } }: IReduxState) => ({
  roomId: currentRoom ? currentRoom.id : -1,
  roomName: currentRoom ? currentRoom.name : '',
  roomType: currentRoom ? currentRoom.type : RoomType.PUBLIC,
});

const roomTypeTextMapping = {
  [RoomType.PRIVATE]: '(私人)',
  [RoomType.PUBLIC]: '',
};

const RoomHeader = React.memo(function RoomHeader() {
  useDocumentTitle('房间');
  const { roomName, roomType, roomId } = useSelector(
    selectorPlayingRoom,
    shallowEqual,
  );

  const dispatch = useDispatch();

  return (
    <AppBar
      style={{
        boxShadow: 'none',
      }}
      position="static"
    >
      <Toolbar>
        <Button
          onClick={() => {
            dispatch(roomEffects.leaveRoom());
          }}
          color="inherit"
        >
          <BackIcon />
          离开房间
        </Button>
        <Typography
          style={{
            flex: 1,
            textAlign: 'center',
          }}
        >
          {roomName}
          {roomTypeTextMapping[roomType]}
        </Typography>
        <Button color="inherit">
          房间号: {String(roomId).padStart(5, '0')}
        </Button>
      </Toolbar>
    </AppBar>
  );
});

export default RoomHeader;
