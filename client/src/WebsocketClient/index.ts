import ResponseMessage from '@/types/models/ResponseMessage';
import RequestMessage from '@/types/models/RequestMessage';
import EventEmitter from 'eventemitter3';
// import RequestMessage from './models/RequestMessage';

export default class WebsocketClient extends EventEmitter {
  isConnected = false;
  ws: WebSocket;
  messageCache: RequestMessage[] = [];

  constructor(
    public options: {
      addr: string;
    },
  ) {
    super();
    this.ws = new window.WebSocket(this.options.addr);

    // 注册事件
    this.ws.onopen = () => {
      this.isConnected = true;
      this.sendMessageFromCache();
    };
    this.ws.onclose = () => {
      this.isConnected = false;
    };
    this.ws.onerror = evt => {
      console.error(evt);
    };
    this.ws.onmessage = ({ data: rawMessage }) => {
      const respMsg: ResponseMessage = JSON.parse(rawMessage);
      this.trigger('message', respMsg);
      if (respMsg.requestId != null) { // 带着 requestId，说明这个响应是针对某个请求产生的
        this.trigger(respMsg.requestId, respMsg);
      }
      if (respMsg.trigger != null) { // 带着 trigger，说明这个响应是针对某个事件产生的
        this.trigger(respMsg.trigger, respMsg);
      }
    };
    // end 注册事件

  }

  debug() {
    this.listen('message', (_, respMsg) => {
      if (
        respMsg.trigger === undefined ||
        (respMsg.trigger !== undefined && respMsg.trigger !== 'timeout')
      ) {
        console.log('recive', respMsg);
      }
    });
  }

  sendMessageFromCache() {
    // 主要是为了处理应用已经加载完成，但是还没建立连接的情况，相当于人为加了一个缓冲层，只要没有connected，这些msg就不会发送
    this.messageCache.forEach(msg => {
      this.sendMessage(msg);
    });
    this.messageCache = [];
  }

  sendMessage(reqMsg: RequestMessage) {
    const { isConnected, ws } = this;
    if (isConnected) {
      ws.send(JSON.stringify(reqMsg));
    } else {
      this.messageCache.push(reqMsg);
    }
  }

  // 不需要等待回复的请求不要用这个方法，会导致内存泄漏，因为无法触发对应reqesut Id的回调函数
  // 则永远不会调用和删除回调
  request(handler: string, data?: any) {
    return new Promise<ResponseMessage>((resolve, reject) => {
      const reqMsg = new RequestMessage(data, handler);
      this.listenOnce(reqMsg.id, (_: unknown, respMsg: ResponseMessage) => {
        if (respMsg == null) {
          console.error(`${reqMsg.handler}-${reqMsg.id} 返回来空的message`);
        }

        if (respMsg.error != null) {
          this.trigger('error', respMsg);
          reject(respMsg.error);
        }

        resolve(respMsg);
      });
      this.sendMessage(reqMsg);
    });
  }

  listen(
    eventName: string,
    callback: (messageData: unknown, message: ResponseMessage) => void,
  ) {
    this.on(eventName, callback);
    return () => {
      this.off(eventName, callback);
    };
  }
  listenOnce(
    eventName: string,
    callback: (messageData: unknown, message: ResponseMessage) => void,
  ) {
    this.once(eventName, callback);
    return () => {
      this.off(eventName, callback);
    };
  }

  trigger(eventName: string, msg: RequestMessage) {
    this.emit(eventName, msg.data, msg);
  }
}
