import './index.scss';

import { roomActions, userActions } from '@client/store/actions';
import { roomEffects } from '@client/store/effects';
import { IReduxState } from '@client/store/reducers';
import FullScreenLoading from '@client/ui/FullScreenLoading';
import UserAvatar from '@client/ui/UserAvatar';
import wsClient from '@client/WebsocketClient/wsClient';
import {
  AppBar,
  Toolbar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { ReservedEventName } from '../../../../shared/constants';
import ChattingMessage from '../../../../shared/models/ChattingMessage';
import { IGame, IUser } from '../../../../shared/types';
import AnswerInputBox from './components/AnswerInputBox';
import CanvasContainer from './components/CanvasContainer';
import GameHeader from './components/GameHeader';

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

  useEffect(() => {
    if (currentGame == null) {
      dispatch(roomEffects.getGame());
    }
  }, [currentGame, dispatch]);

  const [chattingList, setChattingList] = useState<ChattingMessage[]>([]);
  const [isShowPlayOverPanel, setIsShowPlayOverPanel] = useState(false);

  useEffect(() => {
    const chattingMessageOff = wsClient.on(
      ReservedEventName.GAME_CHATTING,
      msgData => {
        setChattingList(prevList => [msgData as ChattingMessage, ...prevList]);
      },
    );

    const playOverOff = wsClient.on(ReservedEventName.PLAY_OVER, () => {
      setIsShowPlayOverPanel(true);
    });

    const gameOverOff = wsClient.on(ReservedEventName.GAME_OVER, msgData => {
      const { user } = msgData as {
        user: IUser;
      };
      dispatch(userActions.createSetIsGaming(user.isGaming));
    });

    const refreshGameOff = wsClient.on(
      ReservedEventName.REFRESH_GAME,
      msgData => {
        const { game } = msgData as {
          game: IGame;
        };
        dispatch(roomActions.createSetCurrentGame(game));
      },
    );

    const changeDrawerOff = wsClient.on(
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
      chattingMessageOff();
      gameOverOff();
      refreshGameOff();
      changeDrawerOff();
      playOverOff();
    };
  }, [setIsShowPlayOverPanel, setChattingList, dispatch]);

  const isSelfPlaying = useMemo(() => {
    // 自己是画家还是猜测的人
    if (user == null || currentGame == null) return false;
    if (user.id === currentGame.playInfo.currentPlayer.id) return true;
    return false;
  }, [user, currentGame]);

  if (currentGame == null || user == null) return <FullScreenLoading />;

  return (
    <>
      <Dialog
        open={isShowPlayOverPanel}
        onClose={() => setIsShowPlayOverPanel(false)}
      >
        <DialogTitle>
          正确答案是: {currentGame.playInfo.keyword.raw}
        </DialogTitle>
        <DialogContent>
          {isSelfPlaying ? <Button variant="outlined" disabled={true}>保存此次画作到本地</Button> : null}
        </DialogContent>
      </Dialog>
      <div className="view-game">
        <GameHeader isSelfPlaying={isSelfPlaying} currentGame={currentGame} />
        <div className="view-game-main">
          <CanvasContainer
            isSelfPlaying={isSelfPlaying}
            initialDrawing={currentGame.newestDrawing}
          />
          {isSelfPlaying ? null : <AnswerInputBox wsClient={wsClient} />}
          <div className="user-list">
            {currentGame.users.map(gameUser => (
              <div key={gameUser.id} className="user-list-user">
                <UserAvatar avatar={gameUser.username[0]}>
                  {gameUser.id === user.id ? (
                    <UserAvatar.AvatarStatus text="我" />
                  ) : null}
                  <UserAvatar.AvatarStatus
                    text={`${currentGame.userScores[gameUser.id]}分`}
                  />
                  {gameUser.id === currentGame.playInfo.currentPlayer.id ? (
                    <UserAvatar.AvatarStatus text="正在绘画" />
                  ) : null}
                  {gameUser.isOnline ? null : (
                    <UserAvatar.AvatarStatus text="已离线" />
                  )}
                </UserAvatar>
                <div className="username">{gameUser.username}</div>
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
      </div>
    </>
  );
}
