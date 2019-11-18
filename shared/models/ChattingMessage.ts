import uuidv4 from 'uuid/v4';

export default class ChattingMessage {
  id = uuidv4();
  timestamp = Date.now();
  constructor(public content: string, public speaker: {
    name: string;
    id: string;
  }) {

  }
}
