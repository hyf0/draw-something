import './Canvas.scss';

import CanvasController, { ICanvasControllerSetting } from '@client/controller/CanvasController';
import Point from '@client/controller/Point';
import DrawAction, { DrawActionType } from '@client/model/DrawAction';
import WebsocketClient from '@client/WebsocketClient';
import { IconButton } from '@material-ui/core';
import { Redo as RedoIcon, RestoreFromTrash as ClearIcon, Undo as UndoIcon } from '@material-ui/icons';
import React, { createRef, TouchEvent } from 'react';

import RequestMessage from '../../../../../../shared/models/RequestMessage';
import SetPenColorButton from './SetPenColorButton';
import SetPenSizeButton from './SetPenSizeButton';

// import RequestMessage from '@client/WebsocketClient/models/RequestMessage';

interface ICanvasState {
  futureDrawings: string[];
  pastDrawings: string[];
  penColor: string;
  penSize: number;
}

export default class Canvas extends React.PureComponent<
  {
    isSelfPlaying: boolean;
    wsClient: WebsocketClient;
    initialDrawing?: string;
  },
  ICanvasState
> {
  state: ICanvasState = {
    futureDrawings: [],
    pastDrawings: [],
    penColor: '#000',
    penSize: 1,
  };
  posElRef = createRef<HTMLDivElement>();
  draw = new CanvasController();
  // warn 维持一个currentDrawing变量,每次都调用toDataUrl是非常消耗性能的操作

  // 生命周期

  componentDidMount() {
    this.draw.mount('#id-canvas');
    this.bindEvents();
    const { initialDrawing } = this.props;
    if (initialDrawing !== undefined) {
      this.draw.drawImage(initialDrawing);
    }
  }

  componentWillUnmount() {
    const { wsClient } = this.props;
    wsClient.off('drawAction');
  }

  bindEvents() {
    const { wsClient } = this.props;
    const { draw } = this;
    wsClient.on('drawAction', respMsgData => {
      // if (!this.props.isSelfPlaying) return; // 不能写上面，闭包导致无法取得变量最新值
      const drawAction = respMsgData as DrawAction;
      const { type, payload } = drawAction;
      switch (type) {
        case DrawActionType.START_DRAW_LINE:
          {
            const { point, setting } = payload as {
              point: Point;
              setting?: ICanvasControllerSetting;
            };
            let prevSetting = draw.getSetting();
            if (setting != null) draw.setting(setting);
            draw.drawPoint(point);
            draw.startDrawLine(point);
            draw.setting(prevSetting);
          }
          break;
        case DrawActionType.DRAW_LINE_TO:
          {
            const { point, setting } = payload as {
              point: Point;
              setting?: ICanvasControllerSetting;
            };
            let prevSetting = draw.getSetting();
            if (setting != null) draw.setting(setting);
            draw.drawLineTo(point);
            draw.setting(prevSetting);
          }
          break;
        case DrawActionType.CLEAR_CANVAS:
          draw.clearCanvas();
          break;
        case DrawActionType.DRAW_IMAGE:
          {
            const imgData = payload as string;
            draw.drawImage(imgData);
          }
          break;
      }
    });
  }

  // -- end 生命周期

  // 辅助函数

  sendDrawActionToServer(
    type: DrawActionType,
    payload?: unknown,
    extral?: { newestDrawing?: string },
  ) {
    const { wsClient, isSelfPlaying } = this.props;
    if (!isSelfPlaying) return;
    const drawAction = new DrawAction(type, payload);
    const reqMsg = new RequestMessage(
      {
        drawAction,
        ...(extral !== undefined ? extral : {}),
      },
      'drawAction',
    );
    wsClient.sendMessage(reqMsg);
  }

  getPointFromEvent = (evt: TouchEvent): Point => {
    // 获得相对画布左上角的坐标
    const { touches, target } = evt;
    const t = touches[0];
    const { clientX, clientY } = t;
    const result = {
      x: clientX - (target as HTMLCanvasElement).offsetLeft,
      y: clientY - (target as HTMLCanvasElement).offsetTop,
    };
    return result;
  };

  // 画画相关

  snapshotCurrentDrawing() {
    const curDrawing = this.draw.getSnapshot();
    this.setState(prevState => ({
      pastDrawings: prevState.pastDrawings.concat(curDrawing),
    }));
  }

  startDrawLine(p: Point) {
    const { draw } = this;
    const { futureDrawings } = this.state;
    if (futureDrawings.length !== 0) {
      this.setState({
        futureDrawings: [],
      });
    }

    draw.drawPoint(p);
    draw.startDrawLine(p);

    this.sendDrawActionToServer(DrawActionType.START_DRAW_LINE, {
      point: p,
      setting: draw.getSetting(),
    });
  }

  drawLineTo(to: Point) {
    const { draw } = this;
    draw.drawLineTo(to);

    this.sendDrawActionToServer(DrawActionType.DRAW_LINE_TO, {
      point: to,
      setting: draw.getSetting(),
    });
  }

  endDrawing = () => {
    this.sendDrawActionToServer(DrawActionType.END_DRAW_LINE, undefined, {
      newestDrawing: this.draw.getSnapshot(),
    });
  };

  clearCanvas = () => {
    this.snapshotCurrentDrawing();

    this.draw.clearCanvas();
    this.sendDrawActionToServer(DrawActionType.CLEAR_CANVAS, {
      newestDrawing: this.draw.getSnapshot(),
    });
  };

  undoDrawing = () => {
    const { draw } = this;
    const { pastDrawings, futureDrawings } = this.state;
    if (pastDrawings.length === 0) return;
    const pastDrawing = pastDrawings.pop() as string;
    draw.drawImage(pastDrawing);

    this.setState({
      pastDrawings: [...pastDrawings],
      futureDrawings: [...futureDrawings, draw.getSnapshot()],
    });

    this.sendDrawActionToServer(DrawActionType.DRAW_IMAGE, pastDrawing, {
      newestDrawing: pastDrawing,
    });
  };

  redoDrawing = () => {
    const { draw } = this;
    const { pastDrawings, futureDrawings } = this.state;
    if (futureDrawings.length === 0) return;

    const futureDrawing = futureDrawings.pop() as string;
    draw.drawImage(futureDrawing);

    this.setState({
      pastDrawings: [...pastDrawings, draw.getSnapshot()],
      futureDrawings: [...futureDrawings],
    });

    this.sendDrawActionToServer(DrawActionType.DRAW_IMAGE, futureDrawing, {
      newestDrawing: futureDrawing,
    });
  };

  setPenColor = (penColor: string) => {
    this.draw.penColor = penColor;
    this.setState({ penColor });
  };

  setPenSize = (penSize: number) => {
    this.draw.penSize = penSize;
    this.setState({ penSize });
  };

  // -- end 辅助函数

  handleTouchStart = (evt: TouchEvent) => {
    this.snapshotCurrentDrawing();

    const p = this.getPointFromEvent(evt);
    this.startDrawLine(p);

    // this.startDrawLine(this.getPointFromEvent(evt));
  };

  handleTouchMove = (evt: TouchEvent) => {
    const p = this.getPointFromEvent(evt);
    this.drawLineTo(p);
  };

  handleTouchEnd = (evt: TouchEvent) => {
    this.endDrawing();
  };

  render() {
    const { isSelfPlaying } = this.props;
    const { futureDrawings, pastDrawings, penColor, penSize } = this.state;
    const { draw, setPenColor, setPenSize } = this;
    return (
      <div>
        <div className="canvas-wrapper">
          <div
            id="id-canvas"
            style={{
              width: 375,
              height: 300,
            }}
            onTouchStart={isSelfPlaying ? this.handleTouchStart : undefined}
            onTouchMove={isSelfPlaying ? this.handleTouchMove : undefined}
            onTouchEnd={isSelfPlaying ? this.handleTouchEnd : undefined}
          />
        </div>
        {!isSelfPlaying ? null : (
          <div ref={this.posElRef} className="game-canvas-operations">
            <SetPenColorButton
              anchorEl={this.posElRef.current}
              draw={draw}
              penColor={penColor}
              setPenColor={setPenColor}
            />
            <SetPenSizeButton
              penSize={penSize}
              penColor={penColor}
              setPenSize={setPenSize}
              anchorEl={this.posElRef.current}
            />
            <IconButton
              disabled={pastDrawings.length === 0}
              onClick={this.undoDrawing}
              style={{ flex: '1' }}
              className="canvas-operation-list-item"
            >
              <UndoIcon fontSize="large" />
            </IconButton>
            <IconButton
              disabled={futureDrawings.length === 0}
              style={{ flex: '1' }}
              onClick={this.redoDrawing}
              className="canvas-operation-list-item"
            >
              <RedoIcon fontSize="large" />
            </IconButton>
            <IconButton
              style={{ flex: '1', color: '#000' }}
              className="canvas-operation-list-item"
              onClick={this.clearCanvas}
            >
              <ClearIcon fontSize="large" />
            </IconButton>
          </div>
        )}
      </div>
    );
  }
}
