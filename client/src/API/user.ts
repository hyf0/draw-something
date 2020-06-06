import wsClient from "@/WebsocketClient/wsClient";
import { IUser } from "@/types/service";

export async function login(token?: string) {
  const user = (await wsClient.request('login', token)).data as IUser;
  return user;
}

export async function changeUsername(username: string) {
  const changed = (await wsClient.request(
    'changeUsername',
    username,
  )).data as string;
  return changed;
}
