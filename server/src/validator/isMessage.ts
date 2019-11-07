import { IMessage } from "../types";


export default function isMessage(target: any): target is IMessage {
  if (target == null || typeof target !== 'object') return false;
  if (typeof target.type !== 'string') return false;
  return true;
}
