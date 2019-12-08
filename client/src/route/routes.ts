import AuthLoyout from '@/layout/AuthLayout';
import BasicLayout from '@/layout/BasicLayout';
import CustomThemeLayout from '@/layout/CustomThemeLayout';
import Game from '@/views/game/Game';
import GameLobby from '@/views/GameLobby';
import CreateRoom from '@/views/room/CreateRoom';
import PlayingRoom from '@/views/room/PlayingRoom';

interface IRoute {
  path: string;
  component: (...args: any[]) => JSX.Element;
  layout?: (...args: any[]) => JSX.Element;
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
                component: CreateRoom,
              },
              {
                path: '/game/:id',
                component: Game,
              },
              {
                path: '/room/:roomId',
                component: PlayingRoom,
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
