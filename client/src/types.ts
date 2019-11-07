
export interface IMessage {
  type: string;
  id?: string;
  error?: boolean;
  data: unknown;
}
