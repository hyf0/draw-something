export enum DrawActionType {
  START_DRAW_LINE = 'startDrawLine',
  DRAW_LINE_TO = 'drawLineTo',
  DRAW_IMAGE = 'drawImage',
  CLEAR_CANVAS = 'clearCanvas',
  UNDO_DRAWING = 'undoDrawing',
  REDO_DRAWING = 'redoDrawing',
}


export default class DrawAction {
  constructor(public type: DrawActionType, public payload?: any) {}
}
