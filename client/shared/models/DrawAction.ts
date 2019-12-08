export enum DrawActionType {
  START_DRAW_LINE = 'startDrawLine',
  DRAW_LINE_TO = 'drawLineTo',
  // END_DRAW_LINE = 'endDrawLine',
  DRAW_IMAGE = 'drawImage',
  // CLEAR_CANVAS = 'clearCanvas',
  // SET_OPTIONS = 'setOptions',
}

export type TDrawerExternals = Omit<DrawAction, 'type' | 'payload'>;


export default class DrawAction {
  static Type = DrawActionType;
  ignore?: boolean; // 要求服务器忽略转发此 action
  constructor(public type: DrawActionType, public payload?: unknown, externals?: TDrawerExternals) {
    Object.assign(this, externals);
  }
}
