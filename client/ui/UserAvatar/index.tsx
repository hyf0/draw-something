import React from 'react';
import { deepOrange } from '@material-ui/core/colors'

import './index.scss';

function AvatarStatus({ text, bgColor }: { text: string, bgColor?: 'red' | 'blue' | 'green'}) {
  return <div style={{
    backgroundColor: bgColor || 'blue',
  }} className="user-avatar-status">{text}</div>;
}
React.createElement(AvatarStatus);
function UserAvatar({ children, avatar, style }: { children?: any; avatar: string, style?: React.CSSProperties  }) {
  return (
    <div
      style={{
        height: '18vw',
        width: '18vw',
      }}
      className="user-avatar-wrapper"
    >
      {children}
      <div style={{
        backgroundColor: deepOrange[500],
        ...style,
      }} className="user-avatar">{avatar}</div>
    </div>
  );
}

UserAvatar.AvatarStatus = AvatarStatus;

export default UserAvatar;
