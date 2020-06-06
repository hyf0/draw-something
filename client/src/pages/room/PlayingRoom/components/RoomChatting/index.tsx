import './index.scss';

import { roomEffects } from '@/store/effects';
import { IReduxState } from '@/store/reducers';
import { createHandleOnKeyEnterUp } from '@/util/helper';
import wsClient from '@/WebsocketClient/wsClient';
import { Button, ListItem, TextField, Divider } from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { ReservedEventName } from '@/types/constants';
import ChattingMessage from '@/types/models/ChattingMessage';

const selectorRoomMessage = ({
  user: { user },
}: IReduxState) => ({
  username: user == null ? '' : user.username,
  userId: user == null ? '' : user.id,
});

function RoomChatting() {
  const { userId } = useSelector(
    selectorRoomMessage,
    shallowEqual,
  );
  const [chatMsgList, setChatMsgList] = useState<ChattingMessage[]>([]);
  useEffect(() => {
    const offReciveChatMessage = wsClient.listen(ReservedEventName.ROOM_CHATTING, (_, msg) => {
      const chatMsg = msg.data as ChattingMessage;
      setChatMsgList(prev => [chatMsg].concat(...prev));
    });
    return offReciveChatMessage;
  }, [setChatMsgList]);

  // chat msg 相关

  const [chattingContent, setChattingContent] = useState('');
  const dispatch = useDispatch();
  const sendChatMessage = useCallback(() => {
    if (chattingContent.trim().length === 0) return;
    setChattingContent('');
    dispatch(roomEffects.sendChatMessage(chattingContent));
  }, [chattingContent, dispatch, setChattingContent]);

  return (
    <div className="room-message">
      <div className="room-message-list">
        {chatMsgList.map(cm => (
          <ListItem className="room-message-list-item" key={cm.id}>
            <div className="room-message-speaker">
              <span className="room-message-speaker-name">
                {cm.speaker.id === userId ? '我' : cm.speaker.name}:
              </span>

            </div>
            <div className="room-message-content">{cm.content}</div>
            <div className="room-message-speaker-time">
              {new Date(cm.timestamp).toLocaleTimeString()}
            </div>
          </ListItem>
        ))}
      </div>
      <Divider />
      <div className="room-message-sender">
          <TextField
            variant="outlined"
            value={chattingContent}
            onChange={evt => setChattingContent(evt.target.value)}
            onKeyUp={createHandleOnKeyEnterUp(sendChatMessage)}
            fullWidth
          />
          &nbsp;
          <Button
            onClick={sendChatMessage}
            variant="contained"
            color="primary"
          >
            发送
          </Button>
      </div>
    </div>
  );
}

export default RoomChatting;
