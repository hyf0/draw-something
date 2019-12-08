import './index.scss';

import wsClient from '@/WebsocketClient/wsClient';
import React, { useEffect, useState } from 'react';

import { ReservedEventName } from 'shared/constants';
import ChattingMessage from 'shared/models/ChattingMessage';

// 以 375宽 为标准

function GameChattingMessage() {

  const [chattingMessageList, setChattingMessageList]  = useState<ChattingMessage[]>([]);

  useEffect(() => {
    const chattingMessageOff = wsClient.listen(
      ReservedEventName.GAME_CHATTING,
      msgData => {
        setChattingMessageList(prevList => [msgData as ChattingMessage, ...prevList]);
      },
    );
    return () => {
      chattingMessageOff();
    }
  }, [])

  return (
    <div className="game-chatting-message-list">
      {chattingMessageList.map(c => (
        <div key={c.id} className="game-chatting-message-list-item">
          {c.speaker.name}: {c.content}
        </div>
      ))}
    </div>
  );
}

export default React.memo(GameChattingMessage);
