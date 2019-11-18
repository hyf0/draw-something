import React, { useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import { IReduxState } from '@client/store/reducers';
import { globalEffects } from '@client/store/effects';
import FullScreenLoading from '@client/ui/FullScreenLoading';

import RoomList from './components/RoomList';
import AccountCard from './components/AccountCard';
import GameLobbyHeader from './components/GameLobbyHeader';

import './index.scss';
import { useDocumentTitle } from '@client/hooks';

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
