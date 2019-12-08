import './index.scss';

import { roomActions, userActions } from '@/store/actions';
import { roomEffects } from '@/store/effects';
import { IReduxState } from '@/store/reducers';
import FullScreenLoading from '@/ui/FullScreenLoading';
import wsClient from '@/WebsocketClient/wsClient';
import { Button, Dialog, DialogContent, DialogTitle } from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { ReservedEventName } from 'shared/constants';
import { IGame, IUser } from 'shared/types';
import AnswerInputBox from './components/AnswerInputBox';
import CanvasContainer from './components/CanvasContainer';
import GameChattingMessage from './components/GameChattingMessage';
import GameHeader from './components/GameHeader';
import GameUserList from './components/GameUserList';

const selectorGame = ({
  room: { currentGame },
  user: { user },
}: IReduxState) => ({
  currentGame,
  user,
});

export default function Game() {
  const { currentGame, user } = useSelector(selectorGame, shallowEqual);
  const dispatch = useDispatch();
  const [gameAnswer, setGameAnswer] = useState('');

  useEffect(() => {
    if (currentGame == null) {
      dispatch(roomEffects.getGame());
    }
  }, [currentGame, dispatch]);

  const [isShowPlayOverPanel, setIsShowPlayOverPanel] = useState(false);

  useEffect(() => {

    const refreshGameUsersOff = wsClient.listen(ReservedEventName.REFRESH_GAME_USERS, msgData => {
      const gameUsers = msgData as IUser[];
      dispatch(roomActions.createSetCurrentGameUsers(gameUsers));
    });

    const playOverOff = wsClient.listen(ReservedEventName.PLAY_OVER, msgData => {
      const { answer } = msgData as { answer: string };
      setGameAnswer(answer);
      setIsShowPlayOverPanel(true);
    });

    const gameOverOff = wsClient.listen(ReservedEventName.GAME_OVER, msgData => {
      const { user } = msgData as {
        user: IUser;
      };
      dispatch(userActions.createSetIsGaming(user.isGaming));
    });

    const refreshGameOff = wsClient.listen(
      ReservedEventName.REFRESH_GAME,
      msgData => {
        const { game } = msgData as {
          game: IGame;
        };
        dispatch(roomActions.createSetCurrentGame(game));
      },
    );

    const changeDrawerOff = wsClient.listen(
      ReservedEventName.CHANGE_DRAWER,
      msgData => {
        const { game } = msgData as {
          game: IGame;
        };
        dispatch(roomActions.createSetCurrentGame(game));
        setIsShowPlayOverPanel(false);
      },
    );

    return () => {
      refreshGameUsersOff();
      gameOverOff();
      refreshGameOff();
      changeDrawerOff();
      playOverOff();
    };
  }, [setGameAnswer, setIsShowPlayOverPanel, dispatch]);

  const isSelfPlaying = useMemo(() => {
    // 自己是画家还是猜测的人
    if (user == null || currentGame == null) return false;
    if (user.id === currentGame.playInfo.drawer.id) return true;
    return false;
  }, [user, currentGame]);

  if (currentGame == null || user == null) return <FullScreenLoading />;

  return (
    <>
      <Dialog
        open={isShowPlayOverPanel}
        // onClose={() => setIsShowPlayOverPanel(false)}
      >
        <DialogTitle>
          正确答案是: {gameAnswer}
        </DialogTitle>
        <DialogContent>
          {isSelfPlaying ? (
            <Button variant="outlined" disabled={true}>
              保存此次画作到本地
            </Button>
          ) : null}
        </DialogContent>
      </Dialog>
      <div className="view-game">
        <GameHeader isSelfPlaying={isSelfPlaying} currentGame={currentGame} />
        <div className="view-game-main">
          <CanvasContainer
            isSelfPlaying={isSelfPlaying}
            currentGame={currentGame}
          />
          {isSelfPlaying ? null : <AnswerInputBox wsClient={wsClient} />}
          <GameUserList user={user} currentGame={currentGame} />
          <GameChattingMessage />
        </div>
      </div>
    </>
  );
}
