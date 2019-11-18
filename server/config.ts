import { IS_DEV_SERVER } from "./util/contants";

function getServerConfig() {
    if (IS_DEV_SERVER) return {
        port: 9421,
    }
    return {
        port: 9421,
    }
}

export const serverConfig = getServerConfig();
