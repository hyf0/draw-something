import * as userActions from './user/actions';
import * as globalActions from './global/actions';
import * as roomActions from './room/actions';


export interface IAction {
    type: string;
    payload?: unknown,
}

export {
    userActions,
    globalActions,
    roomActions,
}
