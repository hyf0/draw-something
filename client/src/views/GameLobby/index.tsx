import "./index.scss";

import { useDocumentTitle } from "@/hooks";
import Notification from "@/model/Notification";
import { globalActions } from "@/store/actions";
import { globalEffects } from "@/store/effects";
import { IReduxState } from "@/store/reducers";
import FullScreenLoading from "@/ui/FullScreenLoading";
import React, { useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import AccountCard from "./components/AccountCard";
import GameLobbyHeader from "./components/GameLobbyHeader";
import RoomList from "./components/RoomList";

const indexSelector = ({
  global: { numberOfOnlinePlayer },
  user: { user }
}: IReduxState) => ({
  numberOfOnlinePlayer,
  user
});

export default function GameLobby() {
  useDocumentTitle("游戏大厅");

  const { numberOfOnlinePlayer, user } = useSelector(
    indexSelector,
    shallowEqual
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
