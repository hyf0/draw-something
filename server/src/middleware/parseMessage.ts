import NodeWebsocket from 'ws';
import { isRequestMessage } from '../models/RequestMessage';

export function parseRawMessage(rawMessage: NodeWebsocket.Data) {
  const msg = JSON.parse(rawMessage.toString());
  if (isRequestMessage(msg)) return msg;
  throw new Error('parseMessage 请求类型错误' + rawMessage.toString());
}
