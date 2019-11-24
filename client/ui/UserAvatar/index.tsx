import React from 'react';

import './index.scss';

function AvatarStatus({ text }: { text: string }) {
  return <div className="user-avatar-status">{text}</div>;
}
React.createElement(AvatarStatus);
function UserAvatar({ children, avatar }: { children: any; avatar: string }) {
  return (
    <div
      style={{
        height: 64,
        width: 64,
      }}
      className="user-avatar-wrapper"
    >
      {children}
      <div style={{
        backgroundColor: 'orange'
      }} className="user-avatar">{avatar}</div>
    </div>
  );
}

UserAvatar.AvatarStatus = AvatarStatus;

export default UserAvatar;
