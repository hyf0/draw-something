import * as userActions from './user/actions';
import * as connectionActions from './connection/actions';
import * as globalActions from './global/actions';
import * as roomActions from './room/actions';


export interface IAction {
    type: string;
    payload?: unknown,
}

export {
    userActions,
    connectionActions,
    globalActions,
    roomActions,
}
