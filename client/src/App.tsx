import React, { useEffect } from 'react';

import AppRouter from '@/router';
import configureStore from '@/store';
import { userActions } from '@/store/actions';
import wsClient from '@/WebsocketClient/wsClient';
import { Provider, useDispatch } from 'react-redux';
import { IUser } from '@/types/service';

export const store = configureStore();

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const refreshPlayerInfoOff = wsClient.listen(
      'refreshPlayerInfo',
      (msgData) => {
        const user = msgData as IUser;
        dispatch(userActions.createSetUser(user));
      },
    );
    return () => {
      refreshPlayerInfoOff();
    };
  }, [dispatch]);

  return (
    <div
      style={
        {
          // height: '100vh',
          // overflow: 'hidden',
        }
      }
      className="App"
    >
      <AppRouter />
    </div>
  );
}

export default function Wrapper() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
