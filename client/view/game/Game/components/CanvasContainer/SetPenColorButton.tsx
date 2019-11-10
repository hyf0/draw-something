import React, { useCallback, useState } from 'react';
import { IconButton, Popover } from '@material-ui/core';
import {
  ColorLens as ColorIcon,
  FiberManualRecord as CircleIcon,
} from '@material-ui/icons';

import CanvasController from '@src/controller/CanvasController';

const colors = [
  '#000',
  '#F44336',
  '#E91E63',
  '#9C27B0',
  '#2196F3',
  '#48C6FF',
  '#4CAF50',
  '#8BC34A',
  '#FFEB3B',
  '#FFC107',
  '#FF9800',
  '#795548',
  '#607D8B',
  '#666',
  '#999',
  '#BBB',
  '#DDD',
  '#FFF',
];

export default function SetPenColorButton({
  anchorEl,
  penColor,
  setPenColor,
}: {
  draw: CanvasController;
  anchorEl: Element | null;
  penColor: string;
  setPenColor: (color: string) => void;
}) {
  const [isShowSetPenColor, setIsShowSetPenColor] = useState(false);
  const updatePenColor = useCallback(
    (color: string) => {
      setPenColor(color);
      setIsShowSetPenColor(false);
    },
    [setPenColor, setIsShowSetPenColor],
  );


  return (
    <>
      <IconButton
        style={{
          flex: '1',
        }}
        onClick={() => setIsShowSetPenColor(prev => !prev)}
        className="canvas-operation-list-item"
      >
        <ColorIcon style={{
          color: penColor,
        }} fontSize="large" />
      </IconButton>
      <Popover
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        anchorEl={anchorEl}
        onClose={() => setIsShowSetPenColor(false)}
        open={isShowSetPenColor}
      >
        <div className="pen-color-wrapper">
          {colors.map(color => (
            <IconButton onClick={() => updatePenColor(color)} key={color}>
              <CircleIcon style={{
                border: '1px solid #000',
                color,
              }} />
            </IconButton>
          ))}
        </div>
      </Popover>
    </>
  );
}
