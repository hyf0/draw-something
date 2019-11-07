import * as userEffects from './user/effects';
import * as globalEffects from './global/effects';
import * as roomEffects from './room/effects';

import { IReduxState } from './reducers';
import { IAction } from './actions';

export type TReduxThunk = (dispatch: TDispatch, getState: () => IReduxState) => Promise<unknown>;
type TDispatch = <ARG_TYPE = IAction | ((...args: unknown[]) => TReduxThunk)>(action: ARG_TYPE ) => ARG_TYPE;

export {
    userEffects,
    globalEffects,
    roomEffects,
}
