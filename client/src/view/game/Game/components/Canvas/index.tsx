import React, { TouchEvent, createRef } from 'react';
import { IconButton } from '@material-ui/core';
import {
  Undo as UndoIcon,
  Redo as RedoIcon,
  RestoreFromTrash as ClearIcon,
} from '@material-ui/icons';
import { produce } from 'immer';

import CanvasController from '@/controller/CanvasController';
import Point from '@/controller/Point';

import SetPenSizeButton from './SetPenSizeButton';
import SetPenColorButton from './SetPenColorButton';

import './index.scss';
import WebsocketClient from '@/WebsocketClient';
import DrawAction, { DrawActionType } from '@/model/DrawAction';
import RequestMessage from '@/WebsocketClient/models/RequestMessage';

// 以 375宽 为标准

class Canvas extends React.PureComponent<{
  isSelfPlaying: boolean;
  dispatch: (arg: any) => void;
  wsClient: WebsocketClient;
  initialImageUrl?: string;
}> {
  draw = new CanvasController();
  posElRef = createRef<HTMLDivElement>();
  state: {
    penColor: string;
    penSize: number;
    historyDrawing: {
      // 这里应该放在this.state里面
      future: string[];
      past: string[];
    };
  } = {
    penColor: '#000',
    penSize: 2,
    historyDrawing: {
      future: [],
      past: [],
    },
  };

  // 生命周期以及相关方法

  componentDidMount() {
    this.draw.mount('#id-canvas-wrapper');
    if (typeof this.props.initialImageUrl === 'string') {
      this.draw.drawImage(this.props.initialImageUrl);
    }
    this.bindEvents();
  }

  componentWillUnmount() {
    const { wsClient } = this.props;
    wsClient.off('drawAction');
  }

  bindEvents() {
    const { wsClient, isSelfPlaying } = this.props;
    wsClient.on('drawAction', (_, respMsg) => {
      const drawAction = respMsg.data as DrawAction;
      switch (drawAction.type) {
        case DrawActionType.CLEAR_CANVAS:
          this.clearCanvas();
          break;
        case DrawActionType.DRAW_IMAGE:
          {
            const imgUrl: string = drawAction.payload.imgUrl;
            this.drawImage(imgUrl);
          }
          break;
        case DrawActionType.DRAW_LINE_TO:
          {
            console.log('drawAction.payloadd', drawAction.payload);
            const p: Point = drawAction.payload.point;
            const op = drawAction.payload.options;
            const prevOptions = this.draw.getOptions();
            if (op != null) {
              this.draw.setOptions(op);
              console.log('setOptions');
            }
            this.drawLine(p);
            this.draw.setOptions(prevOptions);
          }
          break;
        case DrawActionType.START_DRAW_LINE:
          {
            const p: Point = drawAction.payload.point;
            const op = drawAction.payload.options;
            const prevOptions = this.draw.getOptions();
            this.draw.setPenSize(drawAction.payload.options.penSize);
            if (op != null) this.draw.setOptions(op);
            this.startDrawLine(p);
            this.draw.setOptions(prevOptions);
          }
          break;
        case DrawActionType.UNDO_DRAWING:
          this.undoDrawing();
          break;
        case DrawActionType.REDO_DRAWING:
          this.redoDrawing();
          break;
      }
    });
  }

  sendDrawActionToServer(type: DrawActionType, payload?: any) {
    const { wsClient, isSelfPlaying } = this.props;
    if (!isSelfPlaying) return;
    const drawAction = new DrawAction(type, payload);
    const reqMsg = new RequestMessage(
      {
        drawAction,
        // currentDrawing: this.getCurrentDrawing(), // 将现在的画面同步到服务器上，用于离开游戏又回来的人获得最新画面
        // 这样实现性能上有问题
        currentDrawing: '', // 将现在的画面同步到服务器上，用于离开游戏又回来的人获得最新画面
      },
      'drawAction',
    );
    wsClient.sendMessage(reqMsg);
  }

  // 辅助函数

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

  // 以下全部是画布相关的方法

  setPenColor = (penColor: string) => {
    this.draw.setPenColor(penColor);
    this.setState({ penColor });
  };

  setPenSize = (penSize: number) => {
    this.draw.setPenSize(penSize);
    this.setState({ penSize });
  };

  startDrawLine = (point: Point, ) => {
    this.snapshotCurrentDrawing();

    this.draw.drawPoint(point); // 这里取得是自己的penSizi值
    // this.draw.drawPoint(point, this.state.penSize / 2); // 这里取得是自己的penSizi值
    this.draw.startDrawLine(point);

    console.log('startDrawLine', this.state);

    this.sendDrawActionToServer(DrawActionType.START_DRAW_LINE, {
      point,
      options: {
        penSize: this.state.penSize,
        penColor: this.state.penColor,
      },
    });
  };

  drawLine = (point: Point) => {
    this.draw.drawLineTo(point);
    this.sendDrawActionToServer(DrawActionType.DRAW_LINE_TO, {
      point,
      options: {
        penSize: this.state.penSize,
        penColor: this.state.penColor,
      },
    });
  };

  clearCanvas = () => {
    this.snapshotCurrentDrawing();
    this.draw.clearCanvas();
    this.sendDrawActionToServer(DrawActionType.CLEAR_CANVAS);
  };

  // 时间旅行相关

  drawImage(imgUrl: string) {
    this.draw.drawImage(imgUrl);
  }

  getCurrentDrawing() {
    return this.draw.getSnapshot();
  }

  redoDrawing = () => {
    const { historyDrawing } = this.state;
    if (historyDrawing.future.length > 0) {
      const newHisotryDrawing = produce(this.state.historyDrawing, draft => {
        const { future, past } = draft;
        past.push(this.getCurrentDrawing());

        const drawing = future.pop() as string;
        this.draw.drawImage(drawing);
      });
      this.setState({
        historyDrawing: newHisotryDrawing,
      });

      this.sendDrawActionToServer(DrawActionType.REDO_DRAWING);
    }
  };

  undoDrawing = () => {
    const {
      historyDrawing: { past },
    } = this.state;
    if (past.length > 0) {
      const newHisotryDrawing = produce(this.state.historyDrawing, draft => {
        const { future, past } = draft;
        future.push(this.getCurrentDrawing());

        const drawing = past.pop() as string;
        this.draw.drawImage(drawing);
      });
      this.setState({
        historyDrawing: newHisotryDrawing,
      });

      this.sendDrawActionToServer(DrawActionType.UNDO_DRAWING);
    }
  };

  snapshotCurrentDrawing = () => {
    console.log('snapshotCurrentDrawing');
    const newHisotryDrawing = produce(this.state.historyDrawing, draft => {
      const curDrawing = this.getCurrentDrawing();
      draft.future = [];
      draft.past.push(curDrawing);
    });
    this.setState({
      historyDrawing: newHisotryDrawing,
    });
  };

  render() {
    const { historyDrawing: hisotryDrawing, penColor, penSize } = this.state;

    return (
      <div className="game-canvas">
        <div className="canvas-wrapper">
          <div
            id="id-canvas-wrapper"
            style={{
              width: 375,
              height: 300,
            }}
            onTouchStart={evt =>
              this.startDrawLine(this.getPointFromEvent(evt))
            }
            onTouchMove={evt => this.drawLine(this.getPointFromEvent(evt))}
          />
        </div>
        <div ref={this.posElRef} className="game-canvas-operations">
          <SetPenColorButton
            anchorEl={this.posElRef.current}
            draw={this.draw}
            penColor={penColor}
            setPenColor={this.setPenColor}
          />
          <SetPenSizeButton
            penSize={penSize}
            penColor={penColor}
            setPenSize={this.setPenSize}
            anchorEl={this.posElRef.current}
          />
          <IconButton
            disabled={hisotryDrawing.past.length === 0}
            onClick={this.undoDrawing}
            style={{ flex: '1' }}
            className="canvas-operation-list-item"
          >
            <UndoIcon fontSize="large" />
          </IconButton>
          <IconButton
            disabled={hisotryDrawing.future.length === 0}
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
      </div>
    );
  }
}

export default Canvas;
