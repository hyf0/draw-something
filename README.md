# 你画我猜(draw something)

你画我猜(draw something)是一个全端采用 TypeScript 编写的游戏程序，前端使用 React 实现, Websocket 作为前后端通信的手段。

[应用演示](http://39.101.200.7:9420/#/)


## 技术栈

- TypeScript
- React
- Material-UI
- NodeJS、Websocket

# Todo

\* 表示正在做

- [x] 核心功能，正常使用
- [x] 断线重连，游戏状态恢复
- [x] 房间聊天室
- [ ] 对题目进行分类，创建房间时候可选择特定类别的题目
- [ ] 注册、登录

## 前端

- [ ] 切换成rem布局，做移动端适配

- [x] 路由
- - [x] 异步加载

- [x] 用户状态(是否离线，多少分，谁是房主，该谁画画了)标识
- [x] 对高频率操作，使用节流函数进行优化
- [ ] 根据手机屏幕大小智能缩放 Canvas 画布，同时保证每个人看到的画布都是完整的
- [ ] 使用 Suspense, Webpack Prefetch 进行代码分割，懒加载应用
- [x] 作画时，禁止浏览器下拉刷新
- [ ] \*完成全局提示，并根据 type 不同，应用不同的样式
- [ ] 保存画作到 LocalStorage，并可以查看历史画作
- [ ] 每一场游戏结束时，增加分数结算界面
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

- [x] 玩家 drawer 正在画的时候，如果 guesser 刷新页面，大概率无法拿到最新的游戏画面 [issu#1](https://github.com/iheyunfei/draw-something/issues/1)

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

### 前端

#### 开发模式

```

1. cd ./client

2. npm run dev

3. 浏览器自动打开应用页面 127.0.0.1:3001

```

### 后端

注意:你的nodejs版本要求是12@或以上

#### 开发模式

```
cd ./server

npm run dev

// 此时服务器已经开始监听本地 9421 端口

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
