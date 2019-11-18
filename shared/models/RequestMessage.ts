
export default class RequestMessage {
  id: string;
  createAt = Date.now();
  constructor(public data: unknown, public handler?: string, public desc?: string) {
    this.id = `${this.handler}-${Date.now()}`;
  }

  toJSON() {
    const { ...publics } = this;
    return publics;
  }
}

export function isRequestMessage(target: any): target is RequestMessage {
  if (target == null) return false;
  if (
    typeof target === 'object' &&
    typeof target.id === 'string' &&
    typeof target.createAt === 'number'
  ) return true;
  return false;
}
