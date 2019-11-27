export * from './room';

export enum ReservedEventName { // 会用到的事件名，这里前后端统一调用这里的，避免字符串拼错什么的
  REFRESH_USER = 'refreshUser',
  REFRESH_ROOM = 'refreshRoom',
  REFRESH_ROOM_LIST = 'refreshRoomList',
  ROOM_CHATTING = 'roomChatting',
  // 游戏相关
  TIMEOUT = 'timeout',
  REFRESH_GAME = 'refreshGame',
  DRAW_ACTION = 'drawAction',
  START_GAME = 'startGame',
  GAME_CHATTING = 'gameChatting',
  CHANGE_DRAWER = 'changeDrawer',
  ROUND_OVER = 'roundOver',
  GAME_OVER = 'gameOver',
  PLAY_OVER = 'playOver',
  REFRESH_GAME_USERS = 'refreshGameUsers',
  // REFRESH_ONLINE_USER_NUMBER = 'refreshOnLineUserNumber',
}
