import './index.scss';

import { AppBar, Button, Toolbar, Typography } from '@material-ui/core';
import { ArrowBackOutlined as BackIcon } from '@material-ui/icons';
import { RoomStatus, RoomType } from '../../../../shared/constants/room';
import { IGame, IRoom, IUser } from 'shared/types';
import { useDocumentTitle } from '@client/hooks';
import { roomActions, userActions } from '@client/store/actions';
import { roomEffects } from '@client/store/effects';
import { IReduxState } from '@client/store/reducers';
import FullScreenLoading from '@client/ui/FullScreenLoading';
import { push } from 'connected-react-router';
import React, { useCallback, useEffect } from 'react';
import { batch as batchDispatch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Redirect, useParams } from 'react-router-dom';

import RoomMessage from './components/RoomMessage';

const selectorPlayingRoom = ({
  room: { currentRoom },
  user: { user },
  connection: { wsClient },
}: IReduxState) => ({
  wsClient,
  currentRoom,
  isReady: user == null ? false : user.isReady,
});

const roomTypeTextDict = {
  [RoomType.PRIVATE]: '(私人)',
  [RoomType.PUBLIC]: '',
};

export default function PlayingRoom() {
  useDocumentTitle('游玩房间');
  const { currentRoom, wsClient, isReady } = useSelector(
    selectorPlayingRoom,
    shallowEqual,
  );

  const { roomId: rawRoomId } = useParams<{ roomId: string }>();
  const roomId = parseInt(rawRoomId, 10);

  const dispatch = useDispatch();
  const toggleGameReady = useCallback(() => {
    dispatch(roomEffects.makeGameIsReady(!isReady));
  }, [isReady, dispatch]);
  useEffect(() => {
    const refreshRoomInfoOff = wsClient.on('refreshRoomInfo', (_, msg) => {
      const room = msg.data as IRoom;
      dispatch(roomActions.createSetRoom(room));
    });
    const allPlayerReadyOff = wsClient.on('startGame', (_, msg) => {
      const { user, game } = msg.data as {
        user: IUser,
        game: IGame,
      };
      batchDispatch(() => {
        dispatch(roomActions.createSetCurrentGame(game));
        dispatch(roomActions.createSetCurrentRoomStatus(RoomStatus.GAMING));
        dispatch(userActions.createSetIsGaming(user.isGaming));
        dispatch(push(`/game/${roomId}`));
      })

    });
    return () => {
      refreshRoomInfoOff();
      allPlayerReadyOff();
    };
  }, [roomId, wsClient, dispatch]);

  useEffect(() => {
    if (Number.isNaN(roomId)) return;
    dispatch(roomEffects.enterRoom(roomId));
  }, [dispatch, roomId]);

  if (rawRoomId == null) return <Redirect to="/" />;
  if (currentRoom == null) return <FullScreenLoading />;

  return (
    <div className="view-playing-room">
      <div className="view-playing-room-header">
        <AppBar
          style={{
            boxShadow: 'none',
          }}
          position="static"
        >
          <Toolbar>
            <Button
              onClick={() => {
                console.log('cliuck');
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
              {currentRoom.name}
              {roomTypeTextDict[currentRoom.type]}
            </Typography>
            <Button color="inherit">
              房间号: {String(currentRoom.id).padStart(5, '0')}
            </Button>
          </Toolbar>
        </AppBar>
      </div>
      <div className="view-playing-room-main">
        <div className="player-list">
          {Array(8)
            .fill(null)
            .map((_, index) => {
              if (index < currentRoom.users.length) {
                const user = currentRoom.users[index];
                return (
                  <div key={index} className="player-list-item active">
                    <div className="player-list-item-avatar">
                      {user.username[0]}
                    </div>
                    <div className="player-list-item-username">
                      {user.username}({user.isReady ? '准备' : '未准备'})
                    </div>
                  </div>
                );
              }
              return (
                <div key={index} className="player-list-item">
                  <div className="player-list-item-avatar">空</div>
                  <div className="player-list-item-username">等待加入</div>
                </div>
              );
            })}
        </div>
        <div className="start-game-button-wrapper">
          <Button onClick={toggleGameReady} className="start-game-button" variant="outlined" fullWidth>
            {isReady ? '取消准备' : '准备'}
          </Button>
        </div>
        <div className="room-message-wrapper">
          <RoomMessage />
        </div>
      </div>
    </div>
  );
}
