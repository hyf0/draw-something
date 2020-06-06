import uuidv4 from 'uuid/v4';

export default class RequestMessage {
  id: string;
  createAt = Date.now();
  constructor(public data: unknown, public handler?: string, public desc?: string) {
    this.id = `${this.handler}-${uuidv4()}`;
  }
}

