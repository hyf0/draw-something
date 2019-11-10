import uuidv4 from 'uuid/v4';

export enum NotificationType {
  ERROR = 'error',
  WARN = 'warn',
  SUCCESS = 'success',
  NORMAL = 'nornal',
}

export default class Notification {
  public id = uuidv4();
  public createAt = Date.now();
  constructor(
    public title: string,
    public detail?: string,
    public type: NotificationType = NotificationType.NORMAL,
  ) {}
}
