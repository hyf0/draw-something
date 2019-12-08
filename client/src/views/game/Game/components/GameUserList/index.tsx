import React from 'react';
import { IGame, IUser } from 'shared/types';
import UserAvatar from '@/ui/UserAvatar';

import './index.scss';

function GameUserList({
  currentGame,
  user,
}: {
  currentGame: IGame;
  user: IUser;
}) {
  return (
    <div className="game-user-list">
      {currentGame.users.map(gameUser => (
        <div key={gameUser.id} className="user-list-user">
          <UserAvatar avatar={gameUser.username[0]}>
            {gameUser.id === user.id ? (
              <UserAvatar.AvatarStatus text="我" />
            ) : null}
            <UserAvatar.AvatarStatus
              text={`${currentGame.userScores[gameUser.id]}分`}
            />
            {gameUser.id === currentGame.playInfo.drawer.id ? (
              <UserAvatar.AvatarStatus text="正在绘画" />
            ) : null}
            {gameUser.isOnLine ? null : (
              <UserAvatar.AvatarStatus bgColor="grey" text="已离线" />
            )}
          </UserAvatar>
          <div className="username">{gameUser.username}</div>
        </div>
      ))}
    </div>
  );
}

export default React.memo(GameUserList);
