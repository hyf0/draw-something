import WebsocketClient from '.';
import config from "@/config";

const wsClient = new WebsocketClient({
  addr: config.addr,
});

export default wsClient;
