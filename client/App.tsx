import React, { useEffect } from 'react';
// import { HashRouter } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router'

import { AppRoute } from './route';
import configureStore, { history } from '@client/store'
import { userEffects } from './store/effects';

export const store = configureStore();
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(userEffects.startListenRefreshPlayerInfo());
    return () => {
      dispatch(userEffects.stopListenRefreshPlayerInfo());
    };
  }, [dispatch]);


  return (
    <div className="App">
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
