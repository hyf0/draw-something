export enum DrawActionType {
  START_DRAW_LINE = 'startDrawLine',
  DRAW_LINE_TO = 'drawLineTo',
  END_DRAW_LINE = 'endDrawLine',
  DRAW_IMAGE = 'drawImage',
  CLEAR_CANVAS = 'clearCanvas',
  // SET_OPTIONS = 'setOptions',
}


export default class DrawAction {
  constructor(public type: DrawActionType, public payload?: any) {}
}
