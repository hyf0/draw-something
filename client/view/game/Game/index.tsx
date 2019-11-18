import './index.scss';

import { roomActions, userActions } from '@client/store/actions';
import { roomEffects } from '@client/store/effects';
import { IReduxState } from '@client/store/reducers';
import AvatarBox from '@client/ui/AvatarBox';
import FullScreenLoading from '@client/ui/FullScreenLoading';
import { AppBar, Toolbar, Typography } from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import ChattingMessage from 'shared/models/ChattingMessage';
import { IGame, IUser } from 'shared/types';

import AnswerInputBox from './components/AnswerInputBox';
import CanvasContainer from './components/CanvasContainer';

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
  const [chattingList, setChattingList] = useState<ChattingMessage[]>([]);
  useEffect(() => {
    const wrongGuessOff = wsClient.on('chattingMessage', msgData => {
      setChattingList(prevList => [msgData as ChattingMessage, ...prevList]);
    });

    const gameOverOff = wsClient.on('gameOver', msgData => {
      const { user } = msgData as {
        user: IUser;
      };
      dispatch(userActions.createSetIsGaming(user.isGaming));
    });

    const refreshGameOff = wsClient.on('refreshGame', msgData => {
      const { game } = msgData as {
        game: IGame;
      };
      dispatch(roomActions.createSetCurrentGame(game));
    });
    const changePlayingUserOff = wsClient.on('changePlayingUser', msgData => {
      const { game } = msgData as {
        game: IGame;
      };
      dispatch(roomActions.createSetCurrentGame(game));
    });

    return () => {
      wrongGuessOff();
      gameOverOff();
      refreshGameOff();
      changePlayingUserOff();
    };
  }, [setChattingList, dispatch, wsClient]);

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

  if (currentGame == null || user == null) return <FullScreenLoading />;

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
            {isSelfPlaying
              ? `请画 ${currentGame.playInfo.keyword.raw}`
              : `${currentGame.playInfo.keyword.raw.length}个字 ${currentGame.playInfo.keyword.hint}`}
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
          {currentGame.users.map(gameUser => (
            <div key={gameUser.id} className="player-list-item">
              <AvatarBox
                text={`${gameUser.username}${
                  gameUser.id === user.id ? '(我)' : ''
                }(${currentGame.userScores[gameUser.id]}}分)`}
              />
            </div>
          ))}
        </div>
        <div className="game-message-list">
          {chattingList.map(c => (
            <div key={c.id} className="game-message-list-item">
              {c.speaker.name}: {c.content}
            </div>
          ))}
          <div className="game-message-list-item">车笔刀 猜：汽车</div>
        </div>
      </div>
      <div className="view-game-footer">
        {isSelfPlaying ? null : <AnswerInputBox wsClient={wsClient} />}
      </div>
    </div>
  );
}
