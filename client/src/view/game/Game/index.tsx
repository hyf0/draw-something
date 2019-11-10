import React, { useEffect, useMemo } from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { AppBar, Typography, Toolbar } from '@material-ui/core';

import { IReduxState } from '@/store/reducers';
import FullScreenLoading from '@/ui/FullScreenLoading';
import AvatarBox from '@/ui/AvatarBox';
import { roomEffects } from '@/store/effects';

import CanvasContainer from './components/CanvasContainer';
import AnswerInputBox from './components/AnswerInputBox';

import './index.scss';

const selectorGame = ({
  room: { currentGame },
  user: { user },
  connection: { wsClient },
}: IReduxState) => ({
  currentGame,
  user,
  wsClient,
});

export default function Game() {
  const { currentGame, user, wsClient } = useSelector(
    selectorGame,
    shallowEqual,
  );

  const dispatch = useDispatch();
  useEffect(() => {
    if (currentGame == null) {
      dispatch(roomEffects.getGame());
    }
  }, [currentGame, dispatch]);

  const isSelfPlaying = useMemo(() => {
    // 自己是画家还是猜测的人
    if (user == null || currentGame == null) return false;
    if (user.id === currentGame.playInfo.currentPlayer.id) return true;
    return false;
  }, [user, currentGame]);

  if (currentGame == null) return <FullScreenLoading />;

  return (
    <div className="view-game">
      <AppBar
        style={{
          boxShadow: 'none',
        }}
        position="static"
      >
        <Toolbar>
          <Typography variant="h6">
            {isSelfPlaying ? '请画 马桶刷' : '三个字 生活用品'}
          </Typography>
        </Toolbar>
      </AppBar>
      <div className="view-game-main">
        <CanvasContainer
          wsClient={wsClient}
          isSelfPlaying={isSelfPlaying}
          initialDrawing={currentGame.newestDrawing}
        />
        <div className="player-list">
          {currentGame.users.map(user => (
            <div key={user.id} className="player-list-item">
              <AvatarBox text={user.username} />
            </div>
          ))}
        </div>
        <div className="game-message-list">
          <div className="game-message-list-item">车笔刀猜：汽车</div>
        </div>
      </div>
      <div className="view-game-footer">
        {isSelfPlaying ? null : <AnswerInputBox />}
      </div>
    </div>
  );
}
