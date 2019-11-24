import uuidv4 from 'uuid/v4';


export default class Notification {
  public id = uuidv4();
  public createAt = Date.now();
  constructor(
    public title: string,
    public type: 'error' | 'warn' | 'success' | 'none' = 'none',
    public detail?: string,
  ) {}
}
