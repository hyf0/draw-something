export * from './service';

export interface IChattingMessage {
  id: string;
  speaker: {
    name: string;
    id: string;
  }
  content: string;
  timestamp: number;
}
