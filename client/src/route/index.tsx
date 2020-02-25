import React, { Suspense } from 'react';
import { Switch, Route } from 'react-router-dom';
import routes, { IRoute } from './routes';
import Penetrate from './Penetrate';
import FullScreenLoading from '@/ui/FullScreenLoading';

export  function gennerateRoutes(routes: IRoute[] | undefined) {
  if (routes == null || routes.length === 0) return null;
  return (
    <Switch>
      {routes.map((route, index) => (
        <Route
          key={`${route.path}-${index}`}
          path={route.path}
          render={() => {
            let RouteComponent = route.component;

            // 处理异步组件
            if (RouteComponent == null && typeof route.lazy === 'function') {
              const LazyRouteComponent = React.lazy(route.lazy);

              return (
                <Suspense fallback={FullScreenLoading}>
                  <LazyRouteComponent>
                    {gennerateRoutes(route.children)}
                  </LazyRouteComponent>
                </Suspense>
              );
            }

            // 并非异步组件，是否是设置route.component属性，没有的话设置透传children的组件
            if (RouteComponent == null) {
              RouteComponent = route.component = Penetrate;
            }

            return (
              <RouteComponent>{gennerateRoutes(route.children)}</RouteComponent>
            );
          }}
        />
      ))}
    </Switch>
  );
}

// function generateRoutes(routes?: IRoute[]) {
//   if (routes == null || routes.length === 0) return null;
//   return (
//     <Switch>
//       {routes.map((route, index) => {
//         const { layout: Layout, component: Component } = route;
//         if (Layout == null)
//           return (
//             <Route
//               key={index}
//               path={route.path}
//               render={() => (
//                 <Component>{generateRoutes(route.children)}</Component>
//               )}
//             ></Route>
//           );
//         return (
//           <Route
//             key={index}
//             path={route.path}
//             render={() => (
//               <Layout>
//                 <Component>{generateRoutes(route.children)}</Component>
//               </Layout>
//             )}
//           ></Route>
//         );
//       })}
//     </Switch>
//   );
// }

export const AppRoute = () => gennerateRoutes(routes);
