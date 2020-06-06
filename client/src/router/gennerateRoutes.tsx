import React, { Suspense } from 'react';
import { Fragment } from 'react';
import { Switch, Route } from 'react-router-dom';
import { IRoute } from './routes';
import FullScreenLoading from '@/ui/FullScreenLoading';



export default function gennerateRoutes(routes: IRoute[] | undefined) {
  if (typeof routes === 'undefined') return null;

  return (
    <Switch>
      {routes.map((route, routeIndex) => {
        const Component =
          route.component !== undefined ? route.component : Fragment;

        if (typeof Component === 'string') {
          console.log('path', `../views/${Component}`);

          const LazyComponent = React.lazy(() =>
            import(/* webpackChunkName: "[request]" */ `../pages${Component[0] === '/' ? Component : '/' + Component}`),
          );

          return (
            <Route exact={!!route.exact} key={routeIndex} path={route.path}>
              <Suspense fallback={<FullScreenLoading />}>
                <LazyComponent>{gennerateRoutes(route.children)}</LazyComponent>
              </Suspense>
            </Route>
          );
        }

        return (
          <Route exact={!!route.exact} key={routeIndex} path={route.path}>
            <Component>{gennerateRoutes(route.children)}</Component>
          </Route>
        );
      })}
    </Switch>
  );
}
