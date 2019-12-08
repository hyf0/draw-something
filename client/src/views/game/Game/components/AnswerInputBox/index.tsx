import './index.scss';

import { createHandleOnKeyEnterUp } from '@/util/helper';
import WebsocketClient from '@/WebsocketClient';
import { Button, TextField } from '@material-ui/core';
import React, { useCallback, useState } from 'react';
import RequestMessage from 'shared/models/RequestMessage';

// 以 375宽 为标准

function AnswerInputBox({ wsClient }: { wsClient: WebsocketClient }) {
  const [answer, setAnswer] = useState('');

  const sendGuessAnswer = useCallback(() => {
    if (answer.trim().length === 0) return;
    const reqMsg = new RequestMessage(answer, 'guessAnswer');
    wsClient.sendMessage(reqMsg);
    setAnswer('');
  }, [answer, wsClient, setAnswer]);

  const handleOnKeyEnterUp = useCallback(
    createHandleOnKeyEnterUp(sendGuessAnswer),
    [sendGuessAnswer],
  );

  return (
    <div className="answer-input-box">
      <TextField
        onKeyUp={handleOnKeyEnterUp}
        value={answer}
        onChange={evt => setAnswer(evt.target.value.trim())}
        placeholder="输入你猜测的答案"
        className="answer-input"
        variant="outlined"
        type="text"
      />
      <Button variant="outlined" onClick={sendGuessAnswer}>
        发送
      </Button>
    </div>
  );
}

export default AnswerInputBox;
