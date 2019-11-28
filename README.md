# 你画我猜(draw something)

你画我猜(draw something)是一个全端采用 TypeScript 编写的游戏程序，前端使用 React 实现, Websocket 作为前后端通信的手段。

应用地址：[http://iheyunfei.github.io/monica/](http://iheyunfei.com/draw-something/)

## 技术栈

- TypeScript
- React
- Material-UI
- NodeJS、Websocket

<!-- ## 特点

- 使用 LocalStorage 保存了用户的作画，玩家可以查看自己的历史画作
- 基于 Websocket 实现了游戏作画轨迹同步，数据保存、恢复
- 全端使用 TypeScript 开发，共同管理，从而使得前后端可以复用部分代码，保证了代码类型的正确性
- 使用 react-router-dom 实现了带有权限控制的路由
- 依赖于权限控制，根据玩家的状态设置不同的权限，会自动跳转到相应的路由，且无法强制离开
- 对 Canvas API 进行了封装，实现了在 Canvas 作画时的轨迹同步，数据恢复，保存等功能
- 对 WebSocket API 进行了封装，规范、同一了前端的请求入口，集中处理请求错误
- 后端使用 TypeScript 编写，NodeJS 运行，基于 WebSocket 完成了游戏服务器的实现
- 基于 WebSocket 封装了一个后端框架，根据定义好的请求类型，分发给不同的 handler 函数处理
- 通过为用户生成不同的 token，会定时清理断线的用户，同时支持在规定时间内重连恢复的功能 -->



# Todo

\* 表示正在做

- [x] 核心功能，正常使用
- [x] 断线重连，游戏状态恢复
- [x] 房间聊天室
- [ ] 注册、登录

## 前端

- [x] 用户状态(是否离线，多少分，谁是房主，该谁画画了)标识
- [x] 对高频率操作，使用节流函数进行优化
- [ ] \*作画时，禁止浏览器下拉刷新
- [ ] \*完成全局提示，并根据 type 不同，应用不同的样式
- [ ] 保存画作到 LocalStorage，并可以查看历史画作
- [ ] 猜对答案时，增加分数结算界面
- [ ] 游戏时，评论的展示方式为弹幕飞过

## 后端

- [x] 使用观察者模式重构服务代码
- [x] 等概率随机无重复生成用户名、题目
- [ ] 房间匹配
- [ ] 优化公共房间列表接口
- [ ] 保存优秀、灵魂画作到服务端，随机展示

## bug

- [x] 答案显示界面，如果关闭不及时，会显示出下一题的答案

由于网络响应到达顺序不确定，切换游戏题目的响应先于关闭展示答案的响应到达客户端

- [x] 游戏时，用户离线上线会导致游戏画面白屏、刷新

后端在用户上下线会刷新整个游戏信息，导致前端重新渲染

- [x] 玩家 drawer 正在画的时候，如果 guesser 刷新页面，大概率无法拿到最新的游戏画面

现在在某次画画行为结束的时候，会进行一次同步画面，用户依旧无法再画家正在画的时候拿到最新画面，保证这点的

- [ ] 在切换玩家 drawer 时，有个1-2s的加载画面，可能有网络和程序两方面的原因

## 技术难点

- 游戏状态恢复

游戏时，如何在服务端保存当前最新的游戏画面，在用户重连后进行恢复

# 使用

## 开发模式

```
npm run dev // 以开发模式启动服务器和前端项目
```

## 部署

```

1. 修改 server 和 client 文件夹下 config.ts 的中的自己的服务器地址和端口

2. npm run build // 并行编译 server 和 client 端的代码

3. 将前端和后端打包后的文件部署到服务器上

4. 访问服务器地址

```

# 目录结构

```
draw-someting
├── client 前端代码
|  ├── component   公用组件
|  ├── config.ts   全局配置，远程服务器地址、端口号什么的
|  ├── controller  封装了 Canvas 元素后的代码
|  ├── hooks       自定义的 React hooks
|  ├── index.scss
|  ├── index.ts    入口文件
|  ├── layout      布局
|  ├── model       相关的类的实现或类型定义
|  ├── route       路由定义和生成
|  ├── store       Redux 相关代码
|  ├── ui          展示型组件存放处
|  ├── util        辅助函数，和一些常量
|  ├── view        页面组件，被路由直接引用
|  └── WebsocketClient 封装后的 websocket API
├── config  webpack 配置文件
├── docs    webpack 编译的输出目录
├── package.json
├── public
├── README.md
├── scripts webpack 编译相关代码
├── server 后端代码
|  ├── config.ts   全局配置，监听端口号什么的
|  ├── controllers 处理 websocket 链接的代码
|  ├── globals.ts  一些全局变量
|  ├── handlers    根据前端发送的信息，调用不同的 handler 函数进行处理
|  ├── index.ts    入口文件
|  ├── middleware  中间件
|  ├── models      相关的类的实现或类型定义
|  ├── services    游戏相关逻辑的更高级抽象代码，例如 一个用户，一个房间，一场游戏的相关逻辑
|  ├── util        辅助函数
|  ├── validator   ts 的谓词函数定义在这里
|  └── word.txt
├── shared 前后端公用的代码
|  ├── constants 公用的常量
|  ├── models    公用的模型
|  └── types     公用的类型
├── tsconfig.base.json   基本ts配置文件
├── tsconfig.client.json 前端ts编译配置文件
├── tsconfig.json        vscode编辑器使用的配置文件
└── tsconfig.server.json 后端ts编译配置文件
```
