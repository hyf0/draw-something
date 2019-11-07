import React from 'react';

import './index.scss';

export default function AvatarBox({
  avatar,
  text,
}: {
  avatar?: any;
  text: string;
}) {
  return (
    <div className="avatar-box">
      <div className="avatar-box-avatar">{text.length ? text[0] : 'A'}</div>
      <div className="avatar-box-text">{text}</div>
    </div>
  );
}
