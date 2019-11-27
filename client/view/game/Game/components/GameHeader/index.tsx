import './index.scss';

import wsClient from '@client/WebsocketClient/wsClient';
import { AppBar } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';

import { ReservedEventName } from '../../../../../../shared/constants';
import { IGame } from '../../../../../../shared/types';

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
    const timeoutOff = wsClient.on(ReservedEventName.TIMEOUT, msgData => {
      const leftTimeForPlay = msgData as number;
      setGameTimeSoFar(leftTimeForPlay);
    });
    return () => {
      timeoutOff();
    };
  }, [setGameTimeSoFar]);

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
            ? `请画 ${currentGame.playInfo.keyword.raw}`
            : `${currentGame.playInfo.keyword.raw.length}个字 ${currentGame.playInfo.keyword.hint}`}
        </span>
        <span className="game-time-so-far">剩余:{gameTimeSoFar}秒</span>
      </div>
    </AppBar>
  );
}

export default React.memo(GameHeader);
