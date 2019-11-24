import './index.scss';

import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { IReduxState } from 'store/reducers';

import { IUser } from '../../../../../../shared/types';

const arrOfEight = new Array(8).fill(null);

const selectorUserList = ({ user: { user } }: IReduxState) => ({
  userId: user ? user.id : '',
});

const UserList = React.memo(function UserList({ users }: { users: IUser[] }) {
  const { userId } = useSelector(selectorUserList, shallowEqual);
  return (
    <div className="user-list">
      {arrOfEight.map((_, index) => {
        if (index < users.length) {
          const user = users[index];
          return (
            <div key={user.id} className="player-list-item active">
              <div className="user-status">
                {user.id === userId ? (
                  <div className="player-list-item-status">我</div>
                ) : null}
                {user.isReady ? (
                  <div className="player-list-item-status">已准备</div>
                ) : null}
                {user && index === 0 ? (
                  <div className="player-list-item-status">房主</div>
                ) : null}
                <div className="user-avatar">{user.username[0]}</div>
              </div>
              <div className="player-list-item-username">{user.username}</div>
            </div>
          );
        }
        return (
          <div key={index} className="player-list-item">
            <div className="user-status">
              <div className="user-avatar">空</div>
            </div>
            <div className="player-list-item-username">等待加入</div>
          </div>
        );
      })}
    </div>
  );
});

export default UserList;
