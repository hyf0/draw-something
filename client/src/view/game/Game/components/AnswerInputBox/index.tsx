import React from 'react';
import { TextField, Button } from '@material-ui/core';

import './index.scss';

// 以 375宽 为标准

function AnswerInputBox() {
  return (
    <div className="answer-input-box">
      <TextField placeholder="答案" className="answer-input" variant="outlined" type="text" />
      <Button variant="outlined">发送</Button>
    </div>
  );
}

export default AnswerInputBox;
