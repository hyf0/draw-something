import configureStore, { history } from '@client/store';
import { ConnectedRouter } from 'connected-react-router';
import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';


import { AppRoute } from './route';
import { userActions } from './store/actions';
import wsClient from './WebsocketClient/wsClient';
import { IUser } from '../shared/types';

// import { HashRouter } from 'react-router-dom';
export const store = configureStore();



function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const refreshPlayerInfoOff = wsClient.on('refreshPlayerInfo', msgData => {
      const user = msgData as IUser;
      dispatch(userActions.createSetUser(user));
    });
    return () => {
      refreshPlayerInfoOff();
    };
  }, [dispatch]);


  return (
    <div style={{
      // height: '100vh',
      // overflow: 'hidden',
    }} className="App">
      <ConnectedRouter history={history}>
        <AppRoute />
      </ConnectedRouter>
    </div>
  );
}

const AppWrapper = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

export default AppWrapper;
