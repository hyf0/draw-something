import { IS_DEV } from "./util/contants";

function getServerConfig() {
    if (IS_DEV) return {
        port: 9421,
    }
    return {
        port: 9421,
    }
}

export const serverConfig = getServerConfig();
