import React, { useEffect, useRef, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
} from '@material-ui/core';
import { IGame } from '../../../../../shared/types';
import wsClient from '@client/WebsocketClient/wsClient';
import { ReservedEventName } from '../../../../../shared/constants';

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
    }
  }, [setGameTimeSoFar])

  return (
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
          <Button>剩余:{gameTimeSoFar}秒</Button>
      </Toolbar>
    </AppBar>
  );
}

export default React.memo(GameHeader);
