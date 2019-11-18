import React, { useCallback, useState } from 'react';
import { TextField, Button } from '@material-ui/core';

import './index.scss';
import WebsocketClient from '@src/WebsocketClient';
import RequestMessage from '@shared/models/RequestMessage';

// 以 375宽 为标准

function AnswerInputBox({ wsClient }: {
  wsClient: WebsocketClient,
}) {

  const [answer, setAnswer] = useState('');

  const sendGuessAnswer = useCallback(() => {
    if (answer.length === 0) return;
    const reqMsg = new RequestMessage(answer, 'guessAnswer');
    wsClient.sendMessage(reqMsg);
    setAnswer('');
  }, [answer, wsClient, setAnswer]);

  return (
    <div className="answer-input-box">
      <TextField value={answer} onChange={evt => setAnswer(evt.target.value.trim())} placeholder="答案" className="answer-input" variant="outlined" type="text" />
      <Button disabled={answer.length === 0} variant="outlined" onClick={sendGuessAnswer}>发送</Button>
    </div>
  );
}

export default AnswerInputBox;
