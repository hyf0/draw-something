import GameLobby from "@client/view/GameLobby";
import BasicLayout from "@client/layout/BasicLayout";
import CreateRoom from "@client/view/room/CreateRoom";
import PlayingRoom from "@client/view/room/PlayingRoom";
import AuthLoyout from "@client/layout/AuthLayout";
import Game from "@client/view/game/Game";


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
