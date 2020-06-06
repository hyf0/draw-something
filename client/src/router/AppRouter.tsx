import React from 'react';
import { ConnectedRouter } from 'connected-react-router';
import { createHashHistory } from 'history';
import routes from './routes';
import gennerateRoutes from './gennerateRoutes';

const hashHistory = createHashHistory();

export const history = hashHistory;

export default function AppRouter() {
  return <ConnectedRouter history={history}>{gennerateRoutes(routes)}</ConnectedRouter>;
}
