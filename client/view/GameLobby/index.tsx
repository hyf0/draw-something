import './index.scss';

import { useDocumentTitle } from '@client/hooks';
import Notification from '@client/model/Notification';
import { globalActions } from '@client/store/actions';
import { globalEffects } from '@client/store/effects';
import { IReduxState } from '@client/store/reducers';
import FullScreenLoading from '@client/ui/FullScreenLoading';
import React, { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import AccountCard from './components/AccountCard';
import GameLobbyHeader from './components/GameLobbyHeader';
import RoomList from './components/RoomList';

let isTipShowd = false; // 这里

const indexSelector = ({
  global: { numberOfOnlinePlayer },
  user: { user },
}: IReduxState) => ({
  numberOfOnlinePlayer,
  user,
});

export default function GameLobby() {
  useDocumentTitle('游戏大厅');

  const { numberOfOnlinePlayer, user } = useSelector(
    indexSelector,
    shallowEqual,
  );
  const dispatch = useDispatch();
  if (!isTipShowd) {
    dispatch(globalActions.createAddNotification(new Notification('本应用暂时不支持鼠标绘画', 'warn')));
    isTipShowd = true;
  }
  useEffect(() => {
    dispatch(globalEffects.getNumberOfOnlinePlayer());
  }, [dispatch]);


  if (user == null) return <FullScreenLoading />;

  return (
    <div className="view-game-lobby">
      <div className="view-game-lobby-header">
        <GameLobbyHeader />
      </div>
      <div className="view-game-lobby-main">
        <AccountCard />
        <div className="room-list-wrapper">
          <RoomList />
        </div>
      </div>
      <div className="view-game-lobby-footer">
        <div className="number-of-online-player">
          当前在线人数: {numberOfOnlinePlayer}
        </div>
      </div>
    </div>
  );
}
