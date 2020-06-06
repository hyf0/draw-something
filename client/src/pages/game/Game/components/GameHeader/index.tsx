import './index.scss';

import wsClient from '@/WebsocketClient/wsClient';
import { AppBar } from '@material-ui/core';
import React, { useEffect, useState } from 'react';

import { ReservedEventName } from '@/types/constants';
import { IGame } from '@/types/service';

function GameHeader({
  isSelfPlaying,
  currentGame,
}: {
  isSelfPlaying: boolean;
  currentGame: IGame;
}) {
  const [gameTimeSoFar, setGameTimeSoFar] = useState(currentGame.playInfo.time);
  useEffect(() => {
    // let startTime: number;
    const timeoutOff = wsClient.listen(ReservedEventName.TIMEOUT, msgData => {
      const leftTimeForPlay = msgData as number;
      setGameTimeSoFar(leftTimeForPlay);
    });
    return () => {
      timeoutOff();
    };
  }, [setGameTimeSoFar]);

  const { playInfo } = currentGame;

  return (
    <AppBar
      style={{
        boxShadow: 'none',
      }}
      position="static"
    >
      <div className="game-header">
        <span className="game-header-hint">
          {isSelfPlaying
            ? `请画 ${playInfo.keyword.raw}`
            : `${playInfo.keyword.raw.length}个字 ${playInfo.keyword.hint}`}
        </span>
        <span className="game-time-so-far">剩余:{gameTimeSoFar}秒</span>
      </div>
    </AppBar>
  );
}

export default React.memo(GameHeader);
