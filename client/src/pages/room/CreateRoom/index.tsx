import './index.scss';

import { useDocumentTitle } from '@/hooks';
import { globalEffects, roomEffects } from '@/store/effects';
import { IReduxState } from '@/store/reducers';
import {
  AppBar,
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  Radio,
  RadioGroup,
  TextField,
} from '@material-ui/core';
import { ArrowBackOutlined as BackIcon } from '@material-ui/icons';
import { goBack } from 'connected-react-router';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { RoomType } from '@/types/constants/room';

const indexSelector = ({
  global: { numberOfOnlinePlayer },
  user: { user },
}: IReduxState) => ({
  numberOfOnlinePlayer,
  username: user == null ? '' : user.username,
});

export default function CreateRoom() {
  useDocumentTitle('创建房间');

  const { username } = useSelector(indexSelector, shallowEqual);
  const defaultRoomName = `${username}的房间`;
  const [roomName, setRoomName] = useState(defaultRoomName);
  const [roomType, setRoomType] = useState(RoomType.PUBLIC);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(globalEffects.getNumberOfOnlinePlayer());
  }, [dispatch]);

  const createRoom = useCallback(() => {
    dispatch(roomEffects.createRoom(roomName, roomType));
  }, [roomName, roomType, dispatch]);

  const [isUsingDefaultRoomName, setIsUsingDefaultRoomName] = useState(true);
  const updateRoomName = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      setIsUsingDefaultRoomName(false);
      setRoomName(evt.target.value);
    },
    [setRoomName, setIsUsingDefaultRoomName],
  );

  return (
    <div className="view-room-creator">
      <AppBar
        style={{
          boxShadow: 'none',
        }}
        position="static"
      >
        <div className="create-room-header">
          <IconButton onClick={() => dispatch(goBack())}>
            <BackIcon />
          </IconButton>
          <div className="create-room-header-title">创建房间</div>
        </div>
      </AppBar>
      <div className="view-room-creator-main">
        <FormControl fullWidth>
          <List>
            <ListItem>
              <TextField
                label="房间名"
                fullWidth
                placeholder="请输入房间名字"
                type="text"
                variant="outlined"
                value={isUsingDefaultRoomName ? defaultRoomName : roomName}
                onChange={updateRoomName}
              />
            </ListItem>
            <RadioGroup
              value={roomType}
              onChange={evt => setRoomType(evt.target.value as RoomType)}
              name="room-type"
            >
              <ListItem button onClick={() => setRoomType(RoomType.PUBLIC)}>
                <FormControlLabel
                  value={RoomType.PUBLIC}
                  control={<Radio color="primary" />}
                  label="公开"
                  labelPlacement="end"
                />
              </ListItem>
              <ListItem button onClick={() => setRoomType(RoomType.PRIVATE)}>
                <FormControlLabel
                  value={RoomType.PRIVATE}
                  control={<Radio color="primary" />}
                  label="私人(不显示在游戏大厅)"
                  labelPlacement="end"
                />
              </ListItem>
            </RadioGroup>
            <ListItem>
              <Button
                style={{ boxShadow: 'none' }}
                onClick={createRoom}
                fullWidth
                color="primary"
                variant="contained"
              >
                创建房间
              </Button>
            </ListItem>
          </List>
        </FormControl>
      </div>
    </div>
  );
}
