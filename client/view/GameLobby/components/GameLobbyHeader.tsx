import React, { useState, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
} from '@material-ui/core';
import { SearchOutlined as SearchIcon} from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';

import { createHandleOnKeyEnterUp } from '@client/util/helper';


const GameLobbyHeader = React.memo(function GameLobbyHeader () {
  const dispatch = useDispatch();

  const [isShowFindRoom, setIsShowFindRoom] = useState(false);
  const closeFindRoom = useCallback(() => setIsShowFindRoom(false), [setIsShowFindRoom]);

  const [roomId, setRoomId] = useState('');
  const jumoToFindRoom = useCallback(() => {
    if (roomId.trim().length === 0) return;
    dispatch(push(`/room/${roomId}`));
  }, [roomId, dispatch]);

  return (
  <>
    <Dialog open={isShowFindRoom} onClose={closeFindRoom}>
        <DialogTitle>查找房间</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="text"
            placeholder="房间号"
            value={roomId}
            onChange={evt => setRoomId(evt.target.value.trim())}
            onKeyUp={createHandleOnKeyEnterUp(jumoToFindRoom)}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={roomId.trim().length === 0} onClick={jumoToFindRoom}>确定</Button>
          <Button onClick={closeFindRoom}>取消</Button>
        </DialogActions>
      </Dialog>
    <AppBar
      style={{
        boxShadow: 'none',
      }}
      position="static"
    >
      <Toolbar>
        <Button onClick={() => setIsShowFindRoom(true)} color="inherit">
          <SearchIcon />
          查找房间
        </Button>
        <Typography
          style={{
            flex: 1,
            textAlign: 'center',
          }}
        >
          你画我猜-游戏大厅
        </Typography>
        <Button onClick={() => dispatch(push('/create-room'))} color="inherit">
          创建房间
        </Button>
      </Toolbar>
    </AppBar>
  </>
  );
});

export default GameLobbyHeader;
