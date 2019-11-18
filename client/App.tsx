import configureStore, { history } from '@client/store';
import { ConnectedRouter } from 'connected-react-router';
import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector, shallowEqual } from 'react-redux';


import { AppRoute } from './route';
import { IReduxState } from './store/reducers';
import { IUser } from 'shared/types';
import { userActions } from './store/actions';

// import { HashRouter } from 'react-router-dom';
export const store = configureStore();

const selectorApp = ({ connection: { wsClient } }: IReduxState) => ({
  wsClient,
});

function App() {
  const dispatch = useDispatch();
  const { wsClient } = useSelector(selectorApp, shallowEqual);

  useEffect(() => {
    const refreshPlayerInfoOff = wsClient.on('refreshPlayerInfo', msgData => {
      const user = msgData as IUser;
      dispatch(userActions.createSetUser(user));
    });
    return () => {
      refreshPlayerInfoOff();
    };
  }, [wsClient, dispatch]);


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
