import NodeWebsocket from 'ws';

export function parseRawMessage(rawMessage: NodeWebsocket.Data) {
  const msg = JSON.parse(rawMessage.toString());
  if (msg != null && typeof msg === 'object') return msg;
  throw new Error('parseMessage 请求类型错误' + rawMessage.toString());
}
