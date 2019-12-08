import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './routes';

interface IRoute {
  path: string;
  component: (...args: any[]) => JSX.Element;
  layout?: (...args: any[]) => JSX.Element;
  children?: IRoute[];
}

function generateRoutes(routes?: IRoute[]) {
  if (routes == null || routes.length === 0) return null;
  return (
    <Switch>
      {routes.map((route, index) => {
        const { layout: Layout, component: Component } = route;
        if (Layout == null)
          return (
            <Route
              key={index}
              path={route.path}
              render={() => <Component>{generateRoutes(route.children)}</Component>}
            ></Route>
          );
        return (
          <Route
            key={index}
            path={route.path}
            render={() => (
              <Layout>
                <Component>{generateRoutes(route.children)}</Component>
              </Layout>
            )}
          ></Route>
        );
      })}
    </Switch>
  );
}

export const AppRoute = () => generateRoutes(routes);
