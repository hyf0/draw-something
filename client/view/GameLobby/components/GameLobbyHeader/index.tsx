import './index.scss';

import { createHandleOnKeyEnterUp } from '@client/util/helper';
import { AppBar, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from '@material-ui/core';
import { Add as PlusIcon, SearchOutlined as SearchIcon } from '@material-ui/icons';
import { push } from 'connected-react-router';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

const GameLobbyHeader = React.memo(function GameLobbyHeader() {
  const dispatch = useDispatch();

  const [isShowFindRoom, setIsShowFindRoom] = useState(false);
  const closeFindRoom = useCallback(() => setIsShowFindRoom(false), [
    setIsShowFindRoom,
  ]);

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
          <Button
            disabled={roomId.trim().length === 0}
            onClick={jumoToFindRoom}
          >
            确定
          </Button>
          <Button onClick={closeFindRoom}>取消</Button>
        </DialogActions>
      </Dialog>
      <AppBar
        style={{
          boxShadow: 'none',
        }}
        position="static"
      >
        <div className="game-lobby-header">
          <IconButton color="default" onClick={() => setIsShowFindRoom(true)}>
            <SearchIcon />
          </IconButton>
          <div className="game-lobby-header-title">
            你画我猜-游戏大厅(v0.99)
          </div>
          <IconButton onClick={() => dispatch(push('/create-room'))}>
            <PlusIcon />
          </IconButton>
        </div>
      </AppBar>
    </>
  );
});

export default GameLobbyHeader;
