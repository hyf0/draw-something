import { IControllerContext } from '../types';

export default class UserController {
  static login(ctx: IControllerContext) {
    ctx.user.login(ctx);
  }

  static numberOfOnlinePlayer(ctx: IControllerContext) {
    ctx.sendRespData(ctx.globalMaps.userMap.size);
  }

  static changeUsername(ctx: IControllerContext) {
    const newUsername = ctx.message.data as string;
    if (typeof newUsername === 'string' && newUsername.trim().length > 0) {
      ctx.user.changeUsername(newUsername);
      ctx.sendRespData(newUsername);
    }
  }
}
