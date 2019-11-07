import { getIsDevelopment } from "./helper";

export const IS_DEV = getIsDevelopment();

export enum RoomStatus {
  WAITING = 'waiting',
  GAMING = 'gaming',
};

export enum RoomType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}
