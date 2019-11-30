import './index.scss';

import UserAvatar from '@client/ui/UserAvatar';
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
            <div key={user.id} className="user-list-user">
              <UserAvatar avatar={user.username[0]}>
                {user.id === userId ? (
                  <UserAvatar.AvatarStatus text="我" />
                ) : null}
                {user && index === 0 ? (
                  <UserAvatar.AvatarStatus text="房主" />
                ) : null}
                {user.isOnLine ? null : (
                  <UserAvatar.AvatarStatus bgColor="grey" text="已离线" />
                )}
                {user.isReady ? (
                  <UserAvatar.AvatarStatus bgColor="green" text="已准备" />
                ) : null}
              </UserAvatar>
              <div className="user-list-item-username">{user.username}</div>
            </div>
          );
        }
        return (
          <div key={index} className="user-list-user">
            <UserAvatar
              style={{
                backgroundColor: '#fff',
                color: '#000',
              }}
              avatar="空"
            />
            <div className="user-list-item-username">等待加入</div>
          </div>
        );
      })}
    </div>
  );
});

export default UserList;
