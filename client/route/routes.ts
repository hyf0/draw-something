import GameLobby from "@src/view/GameLobby";
import BasicLayout from "@src/layout/BasicLayout";
import CreateRoom from "@src/view/room/CreateRoom";
import PlayingRoom from "@src/view/room/PlayingRoom";
import AuthLoyout from "@src/layout/AuthLayout";
import Game from "@src/view/game/Game";


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
            }
          ]
      },
    ]
  }
];
export default routes;
