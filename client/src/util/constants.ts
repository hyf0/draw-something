import { getIsDevelopment } from "./helper";

export const IS_DEV_CLIENT = getIsDevelopment();

// export enum MessageType { // 注意这里的字面量很重要的，后端根据这个判断调用哪一个service
//     LOGIN = 'login',
//     ROOM_LIST = 'roomList',
// }
