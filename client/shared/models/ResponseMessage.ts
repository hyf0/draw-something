import uuidv4 from 'uuid/v4';

export default class ResponseMessage {
  id = uuidv4();
  createAt = Date.now();
  error?: {
    title: string;
    detail?: string;
  };
  data: unknown;
  requestId?: string;
  trigger?: string;
  desc?: string;
  constructor(options: {
    data: unknown;
    requestId?: string;
    trigger?: string;
    desc?: string;
  }) {
    this.data = options.data;
    this.requestId = options.requestId;
    this.trigger = options.trigger;
    this.desc = options.desc;
  }

  toJSON() {
    const { ...publics } = this;
    return publics;
  }
}
