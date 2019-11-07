import HandlerContext from "../models/HandlerContext";
import User from "../services/User";

export default class UserHandler {

  static login(ctx: HandlerContext) {
    const userToken = ctx.req.data as string | undefined;
    let isReuseedOffLineUser = false;
    if (userToken != undefined) {
      const offLineUser = ctx.globals.sesstionUserMap.get(userToken);
      if (offLineUser != undefined) {
        offLineUser.reuse(ctx.ws);
        ctx.connection.user = offLineUser;  // warn！！ 这个实现很不优雅，看看怎么改进
        isReuseedOffLineUser = true;
        ctx.sendRespData(offLineUser)
        return;
      }
    }
    if (!isReuseedOffLineUser) {
      const user = new User(ctx.ws, ctx.globals);;
      ctx.connection.user = user; // warn！！ 这个实现很不优雅，看看怎么改进
      ctx.sendRespData(user)
    }
  }
  static changeUsername(ctx: HandlerContext) {
    const { user } = ctx;
    if (user == null) return;

    const newUsername = ctx.req.data as string;
    if (typeof newUsername === 'string' && newUsername.trim().length > 0) {
      user.changeUsername(newUsername);
      ctx.sendRespData(newUsername);
    }
  }

  static numberOfOnlineUser(ctx: HandlerContext) {
    ctx.sendRespData(ctx.globals.sesstionUserMap.size);
  }
}
