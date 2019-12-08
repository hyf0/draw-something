import React, { useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { replace } from 'connected-react-router';
import { IReduxState } from '../store/reducers';
import FullScreenLoading from '../ui/FullScreenLoading';
import { userEffects } from '../store/effects';

const selectorAuthLoyout = ({ user: { user }, router: { location: { pathname } } }: IReduxState) => ({
  user,
  pathname,
});

export default function AuthLoyout({ children}: {children: any}) {

  const { user, pathname } = useSelector(selectorAuthLoyout, shallowEqual);


  const dispatch = useDispatch();

  useEffect(() => {
    if (user == null) {
      dispatch(userEffects.login());
      return;
    }

    if (user.isGaming && user.currentRoomId == null) {
      console.error('用户正在游戏中', '但找不到房间号');
    }

    if (user.isGaming && user.currentRoomId != null) {
      const targetPath = `/game/${user.currentRoomId}`;
      if (pathname !== targetPath) dispatch(replace(targetPath));
    } else if (user.currentRoomId != null) {
      const targetPath = `/room/${user.currentRoomId}`;
      if (pathname !== targetPath) dispatch(replace(targetPath));
    }
  }, [user, pathname, dispatch]);

  if (user == null) return <FullScreenLoading />

  return children;
}
