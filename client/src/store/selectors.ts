import { IReduxState } from "./reducers";

export const websocketClientSelector = (state: IReduxState) => state.connection.wsClient;
