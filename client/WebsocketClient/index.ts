import { IS_DEV_CLIENT } from '../util/constants';
import ResponseMessage from '../../shared/models/ResponseMessage';
import RequestMessage from '../../shared/models/RequestMessage';
// import RequestMessage from './models/RequestMessage';

export default class WebsocketClient {
  isConnected = false;
  ws: WebSocket;
  messageCache: RequestMessage[] = [];
  eventMap = new Map<
    string,
    ((messageData: unknown, message: RequestMessage) => void)[]
  >();
  constructor(
    public options: {
      addr: string;
      onopen?: (evt: Event) => void;
      onclose?: (evt: Event) => void;
      onerror?: (evt: Event) => void;
    },
  ) {
    this.ws = new window.WebSocket(this.options.addr);
    this.init();
  }

  init() {
    // 注册事件
    this.ws.onopen = evt => {
      this.isConnected = true;
      if (typeof this.options.onopen === 'function') {
        this.options.onopen(evt);
      }
      this.sendMessageFromCache();
    };
    this.ws.onclose = evt => {
      this.isConnected = false;
      if (typeof this.options.onclose === 'function') {
        this.options.onclose(evt);
        if (IS_DEV_CLIENT) {
          console.log('连接断开');
        }
      }
    };
    this.ws.onerror = evt => {
      if (typeof this.options.onerror === 'function') {
        this.options.onerror(evt);
      }
    };
    this.ws.onmessage = ({ data: rawMessage }) => {
      const msg: ResponseMessage = JSON.parse(rawMessage);
      console.log('recive', msg);
      this.emit('message', msg);
      if (msg.requestId != null) {
        this.emit(msg.requestId, msg);
      }
      if (msg.trigger != null) {
        this.emit(msg.trigger, msg);
      }
    };
    // end 注册事件
  }

  sendMessageFromCache() {
    // 主要是为了处理应用已经加载完成，但是还没建立连接的情况，相当于人为加了一个缓冲层，只要没有connected，这些msg就不会发送
    this.messageCache.forEach(msg => {
      this.sendMessage(msg);
    });
    this.messageCache = [];
  }

  sendMessage(reqMsg: RequestMessage) {
    if (this.isConnected) {
      console.log(`sendMessage`, reqMsg);
      this.ws.send(JSON.stringify(reqMsg));
    } else {
      this.messageCache.push(reqMsg);
    }
  }

  // requestSync(type: string, data?: any) {
  //   const messageId = type + '_' + new Date().getTime(); // 这是为了防止收到过时的信息
  //   const msg: RequestMessage = { data, type, id: messageId };
  //   this.sendMessage(msg);
  // }

  // 不需要等待回复的请求不要用这个方法，会导致内存泄漏，因为无法触发对应reqesut Id的回调函数
  request(handler: string, data?: any) {
    return new Promise<ResponseMessage>((resolve, reject) => {
      try {
        // const messageId = type + '_' + new Date().getTime() // 这是为了防止收到过时的信息
        // const msg: RequestMessage = {data, type, id: messageId}
        const reqMsg = new RequestMessage(data, handler);
        const callback = (_: unknown, respMsg: ResponseMessage) => {
          if (respMsg == null) {
            console.error(`${reqMsg.handler}-${reqMsg.id} 返回来空的message`);
          }

          // 注意，如果针对本次请求，如果服务器端没有回复响应，则永远不会调用和删除回调
          if (respMsg.error != null) {
            this.emit('error', respMsg);
            reject(respMsg.error);
          }

          resolve(respMsg);

          if (respMsg.requestId != null) {
            this.off(respMsg.requestId, callback);
          }
          if (IS_DEV_CLIENT) {
            if (respMsg.requestId != null && respMsg.requestId !== reqMsg.id) {
              console.error(
                `reqMsg.id: ${reqMsg.id} !== respMsg.requestId： ${respMsg.requestId}`,
              );
            }
          }
        };
        this.on(reqMsg.id, callback);
        this.sendMessage(reqMsg);
      } catch (err) {
        console.error(`request时发生错误 ${err}`);
      }
    });
  }

  on(
    eventName: string,
    callback: (messageData: unknown, message: ResponseMessage) => void,
  ) {
    let cbsArray = this.eventMap.get(eventName);
    if (cbsArray == undefined) {
      cbsArray = [];
      this.eventMap.set(eventName, cbsArray);
    }
    cbsArray.push(callback);
    return () => {
      this.off(eventName, callback);
    };
  }
  off(
    eventName: string,
    cb: (messageData: unknown, message: RequestMessage) => void,
  ) {
    let cbsArray = this.eventMap.get(eventName);
    if (cbsArray != undefined) {
      cbsArray = cbsArray.filter(c => c !== cb);
      this.eventMap.set(eventName, cbsArray);
    }
  }
  emit(eventName: string, msg: RequestMessage) {
    const cbs = this.eventMap.get(eventName);
    if (cbs !== undefined) {
      cbs.forEach(c => c(msg.data, msg));
    }
  }
}
