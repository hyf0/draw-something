import HandlerContext from '../models/HandlerContext';
import User from '../services/User';

export default class UserHandler {
  static login(ctx: HandlerContext) {
    const userToken = ctx.req.data as string | undefined;
    let user: User | undefined;
    const offLineUser = ctx.globals.sesstionUserMap.get(userToken || '__guest'); // 如果是 __guest，返回的是undefined
    if (offLineUser != undefined) {
      offLineUser.reuse(ctx.ws);
      user = offLineUser;
    }
    if (user == undefined) user = new User(ctx.ws); // 没找到缓存
    ctx.connection.user = user; // warn！！ 这个实现很不优雅，看看怎么改进
    ctx.sendRespData(user);
  }

  static changeUsername(ctx: HandlerContext) {
    const { user } = ctx;
    if (user == null) {
      ctx.sendRespError('请先登录');
      return;
    }

    const newUsrName = ctx.req.data;
    if (typeof newUsrName === 'string' && newUsrName.trim().length > 0) {
      user.changeUsername(newUsrName);
      ctx.sendRespData(newUsrName);
    }
  }

  static numberOfOnlineUser(ctx: HandlerContext) {
    const result = ctx.globals.sesstionUserMap.size;
    ctx.sendRespData(result);
  }
}
