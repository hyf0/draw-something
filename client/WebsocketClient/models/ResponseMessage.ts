import uuidv4 from 'uuid/v4';

export default class ResponseMessage {
  id = uuidv4();
  createAt = Date.now();
  trigger?: string;
  error?: {
    title: string;
    detail?: string;
  };
  constructor(
    public data: any,
    public requestId?: string,
    trigger?: string,
    public desc?: string,
  ) {
  }

  toJSON() {
    const { ...publics } = this;
    return publics;
  }
}
