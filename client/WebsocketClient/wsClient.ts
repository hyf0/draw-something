import WebsocketClient from ".";
import config from "@client/config";

const wsClient = new WebsocketClient({
  addr: config.addr,
});

export default wsClient;
