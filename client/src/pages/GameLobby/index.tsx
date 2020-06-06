import React, { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { useDocumentTitle } from '@/hooks';
import { globalEffects } from '@/store/effects';
import { IReduxState } from '@/store/reducers';
import FullScreenLoading from '@/ui/FullScreenLoading';
import GenneralLayout from '@/component/GenneralLayout';

import AccountCard from './components/AccountCard';
import GameLobbyHeader from './components/GameLobbyHeader';
import RoomList from './components/RoomList';

import './index.scss';

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
      <GenneralLayout>
        <GenneralLayout.Header>
          <GameLobbyHeader />
        </GenneralLayout.Header>
        <GenneralLayout.Content>
          <AccountCard />
          <div className="room-list-wrapper">
            <RoomList />
          </div>
        </GenneralLayout.Content>
        <GenneralLayout.Footer>
          <div className="number-of-online-player">
            当前在线人数: {numberOfOnlinePlayer}
          </div>
        </GenneralLayout.Footer>
      </GenneralLayout>
    </div>
  );
}
