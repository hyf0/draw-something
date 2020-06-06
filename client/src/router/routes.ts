import AuthLoyout from '@/layout/AuthLayout';
import BasicLayout from '@/layout/BasicLayout';
import CustomThemeLayout from '@/layout/CustomThemeLayout';
import GameLobby from '@/pages/GameLobby';
// import Game from '@/pages/game/Game';
// import CreateRoom from '@/pages/room/CreateRoom';
// import PlayingRoom from '@/pages/room/PlayingRoom';

export interface IRoute {
  path: string;
  component?: string | ((...args: any[]) => JSX.Element);
  lazy?: any;
  exact?: boolean;
  children?: IRoute[];
}

const routes: IRoute[] = [
  {
    path: '/',
    component: AuthLoyout,
    children: [
      {
        path: '/',
        component: BasicLayout,
        children: [
          {
            path: '/',
            component: CustomThemeLayout,
            children: [
              {
                path: '/create-room',
                component: '/room/CreateRoom',
              },
              {
                path: '/game/:id',
                component: '/game/Game',
              },
              {
                path: '/room/:roomId',
                component: '/room/PlayingRoom',
              },
              {
                path: '/',
                component: GameLobby,
              },
            ],
          },
        ],
      },
    ],
  },
];
export default routes;
