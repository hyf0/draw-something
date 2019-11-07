import uuidv4 from 'uuid/v4';

export default class ChattingMessage {
  public id = uuidv4();
  constructor(
    public content: string,
    public speaker: { name: string; id: string },
    public timestamp = Date.now(),
  ) {}
}
