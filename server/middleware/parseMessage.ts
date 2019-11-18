
import { isRequestMessage } from '../../shared/models/RequestMessage';

import NodeWebsocket from 'ws';

export function parseRawMessage(rawMessage: NodeWebsocket.Data) {
  const msg = JSON.parse(rawMessage.toString());
  if (isRequestMessage(msg)) return msg;
  throw new Error('parseMessage 请求类型错误' + rawMessage.toString());
}
