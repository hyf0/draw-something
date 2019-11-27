import './Canvas.scss';

import CanvasController, { ICanvasControllerSetting } from '@client/controller/CanvasController';
import Point from '@client/controller/Point';
import DrawAction, { DrawActionType } from '@client/model/DrawAction';
import { IconButton } from '@material-ui/core';
import { Redo as RedoIcon, RestoreFromTrash as ClearIcon, Undo as UndoIcon } from '@material-ui/icons';
import React, { TouchEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { ReservedEventName } from '../../../../../../shared/constants';
import RequestMessage from '../../../../../../shared/models/RequestMessage';
import { IGame } from '../../../../../../shared/types';
import wsClient from '../../../../../WebsocketClient/wsClient';
import SetPenColorButton from './SetPenColorButton';
import SetPenSizeButton from './SetPenSizeButton';

// import RequestMessage from '@client/WebsocketClient/models/RequestMessage';

function sendDrawActionToServer(
  type: DrawActionType,
  payload?: unknown,
  extral?: { newestDrawing?: string },
) {
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

function getPointFromEvent(evt: TouchEvent): Point {
  // 获得相对画布左上角的坐标
  const { touches, target } = evt;
  const t = touches[0];
  const { clientX, clientY } = t;
  const result = {
    x: clientX - (target as HTMLCanvasElement).offsetLeft,
    y: clientY - (target as HTMLCanvasElement).offsetTop,
  };
  return result;
}

function Canvas({
  isSelfPlaying,
  currentGame,
}: {
  isSelfPlaying: boolean;
  currentGame: IGame;
}) {
  const drawRef = useRef(new CanvasController());
  const draw = drawRef.current;
  const [futureDrawings, setFutureDrawings] = useState<string[]>([]);
  const [pastDrawings, setPastDrawings] = useState<string[]>([]);
  const [penColor, setPenColor] = useState('#000');
  const [penSize, setPenSize] = useState(1);
  const isInitializedRef = useRef(false);

  // 生命周期

  useLayoutEffect(() => {
    if (currentGame.newestDrawing !== undefined) {
      draw.drawImage(currentGame.newestDrawing);
    }
    if (isInitializedRef.current === false) {
      console.log('currentGame', currentGame);
      draw.mount('#id-canvas');
      isInitializedRef.current = true;
    }
  }, [draw, currentGame]);

  useEffect(() => {

    const changePlayingUserOff = wsClient.on(
      ReservedEventName.CHANGE_DRAWER,
      () => {
        // 清除别人在画布上的东西
        draw.clearCanvas();
        setFutureDrawings([]);
        setPastDrawings([]);
      },
    );

    const drawActionOff = wsClient.on(
      ReservedEventName.DRAW_ACTION,
      respMsgData => {
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
      },
    );
    return () => {
      changePlayingUserOff();
      drawActionOff();
    };
  }, [draw, setFutureDrawings, setPastDrawings]);

  // 绘图相关

  const snapshotCurrentDrawing = useCallback(() => {
    const curDrawing = draw.getSnapshot();
    setPastDrawings(prev => prev.concat(curDrawing));
  }, [draw]);

  const startDrawLine = useCallback(
    (p: Point) => {
      if (futureDrawings.length !== 0) {
        setFutureDrawings([]);
      }
      draw.drawPoint(p);
      draw.startDrawLine(p);

      sendDrawActionToServer(DrawActionType.START_DRAW_LINE, {
        point: p,
        setting: draw.getSetting(),
      });
    },
    [draw, futureDrawings, setFutureDrawings],
  );

  const drawLineTo = useCallback(
    (to: Point) => {
      draw.drawLineTo(to);
      sendDrawActionToServer(DrawActionType.DRAW_LINE_TO, {
        point: to,
        setting: draw.getSetting(),
      });
    },
    [draw],
  );

  const clearCanvas = useCallback(() => {
    snapshotCurrentDrawing();

    draw.clearCanvas();
    sendDrawActionToServer(DrawActionType.CLEAR_CANVAS, {
      newestDrawing: draw.getSnapshot(),
    });
  }, [draw, snapshotCurrentDrawing]);

  const undoDrawing = useCallback(() => {
    if (pastDrawings.length === 0) return;
    const pastDrawing = pastDrawings.pop() as string;
    draw.drawImage(pastDrawing);
    setPastDrawings([...pastDrawings]);
    setFutureDrawings([...futureDrawings, draw.getSnapshot()]);
    sendDrawActionToServer(DrawActionType.DRAW_IMAGE, pastDrawing, {
      newestDrawing: pastDrawing,
    });
  }, [pastDrawings, futureDrawings, draw, setPastDrawings, setFutureDrawings]);

  const redoDrawing = useCallback(() => {
    if (futureDrawings.length === 0) return;

    const futureDrawing = futureDrawings.pop() as string;
    draw.drawImage(futureDrawing);
    setPastDrawings([...pastDrawings, draw.getSnapshot()]);
    setFutureDrawings([...futureDrawings]);
    sendDrawActionToServer(DrawActionType.DRAW_IMAGE, futureDrawing, {
      newestDrawing: futureDrawing,
    });
  }, [pastDrawings, futureDrawings, draw, setFutureDrawings, setPastDrawings]);

  // event handler

  const handleTouchStart = useCallback(
    (evt: TouchEvent) => {
      snapshotCurrentDrawing();

      const p = getPointFromEvent(evt);
      startDrawLine(p);
    },
    [snapshotCurrentDrawing, startDrawLine],
  );


  const handleTouchMove = useCallback(
    (evt: TouchEvent) => {
      const p = getPointFromEvent(evt);
      drawLineTo(p);
    },
    [drawLineTo],
  );

  const handleTouchEnd = useCallback(() => {
    const drawing = draw.getSnapshot();
    sendDrawActionToServer(DrawActionType.DRAW_IMAGE, draw.getSnapshot(), {
      newestDrawing: drawing,
    });
  }, [draw]);



  const [posDivEl, setPosDivEl] = useState<HTMLDivElement | null>(null);

  return (
    <div>
      <div className="canvas-wrapper">
        <div
          id="id-canvas"
          style={{
            width: 375,
            height: 300,
          }}
          onTouchStart={isSelfPlaying ? handleTouchStart : undefined}
          onTouchMove={isSelfPlaying ? handleTouchMove : undefined}
          onTouchEnd={isSelfPlaying ? handleTouchEnd : undefined}
        />
      </div>
      {!isSelfPlaying ? null : (
        <div ref={ref => setPosDivEl(ref)} className="game-canvas-operations">
          <SetPenColorButton
            anchorEl={posDivEl}
            draw={draw}
            penColor={penColor}
            setPenColor={(color: string) => {
              draw.penColor = color;
              setPenColor(color);
            }}
          />
          <SetPenSizeButton
            penSize={penSize}
            penColor={penColor}
            setPenSize={(size: number) => {
              draw.penSize = size;
              setPenSize(size);
            }}
            anchorEl={posDivEl}
          />
          <IconButton
            disabled={pastDrawings.length === 0}
            onClick={undoDrawing}
            style={{ flex: '1' }}
            className="canvas-operation-list-item"
          >
            <UndoIcon fontSize="large" />
          </IconButton>
          <IconButton
            disabled={futureDrawings.length === 0}
            style={{ flex: '1' }}
            onClick={redoDrawing}
            className="canvas-operation-list-item"
          >
            <RedoIcon fontSize="large" />
          </IconButton>
          <IconButton
            style={{ flex: '1', color: '#000' }}
            className="canvas-operation-list-item"
            onClick={clearCanvas}
          >
            <ClearIcon fontSize="large" />
          </IconButton>
        </div>
      )}
    </div>
  );
}

export default React.memo(Canvas);
