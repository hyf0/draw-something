import React, { useCallback, useState } from 'react';
import { IconButton, Popover, Slider } from '@material-ui/core';

import PlainLine from '@/ui/PlainLine';

export default function SetPenSizeButton({
  anchorEl,
  penColor,
  penSize,
  setPenSize,
}: {
  anchorEl: Element | null;
  penSize: number;
  setPenSize: (size: number) => void;
  penColor: string;
}) {
  const updatePenSize = useCallback(
    (_: any, value: number | number[]) => {
      const size = value as number;
      setPenSize(size);
    },
    [setPenSize],
  );
  const [isShowSetPenSize, setIsShowSetPenSize] = useState(false);

  return (
    <>
      <IconButton
        style={{
          flex: '1',
        }}
        onClick={() => setIsShowSetPenSize(prev => !prev)}
        className="canvas-operation-list-item"
      >
        <PlainLine color={penColor} length={30} width={penSize} />
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
        anchorEl={anchorEl == null ? undefined : anchorEl}
        onClose={() => setIsShowSetPenSize(false)}
        open={isShowSetPenSize}
      >
        <div className="pen-size-slider-wrapper">
          <Slider
            style={{
              width: '80vw',
            }}
            value={penSize}
            onChange={updatePenSize}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={1}
            max={20}
          />
        </div>
      </Popover>
    </>
  );
}
