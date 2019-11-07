import React from 'react';

export default function PlainLine(props: {
  length?: number;
  width?: number;
  vertical?: boolean;
  color?: string;
}) {
  let { length, width, vertical, color  } = props;
  if (length == null) length = 24;
  if (width == null) width = 2;
  if (vertical == null) vertical = false;
  if (color == null) color = '#000';
  if (vertical) {
    [length, width] = [width, length];
  }
  return (
    <div
      className="plain-line"
      style={{
        height: width,
        width: length,
        backgroundColor: color,
      }}
    />
  );
}
