import React, { useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import { IReduxState } from '@/store/reducers';
import { globalEffects } from '@/store/effects';
import FullScreenLoading from '@/ui/FullScreenLoading';

import RoomList from './components/RoomList';
import AccountCard from './components/AccountCard';
import GameLobbyHeader from './components/GameLobbyHeader';

import './index.scss';

const indexSelector = ({
  global: { numberOfOnlinePlayer },
  user: { user },
}: IReduxState) => ({
  numberOfOnlinePlayer,
  user,
});

export default function GameLobby() {
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