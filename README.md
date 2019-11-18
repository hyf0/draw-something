# 你画我猜(draw something)

你画我猜(draw something)是一个全端采用 TypeScript 编写的游戏程序，前端使用 React 实现, Websocket 作为前后端通信的手段。

应用地址：[http://iheyunfei.github.io/monica/](http://iheyunfei.com/draw-something/)

## 技术栈

- TypeScript
- React
- Material-UI
- NodeJS、Websocket

## 特点

- 使用LocalStorage保存了用户的作画，玩家可以查看自己的历史画作
- 基于 Websocket，实现如何同步玩家之间的由 Canvas 实现的画板

# 使用

## 开发模式

```
npm run dev
```

自动以开发者模式启动服务器和前端项目

## 部署

# Todo

## 前端

- [ ] 重构ui界面
- [ ] 猜对答案时，增加分数结算界面
- [ ] 游戏时，修改评论的展示方式为弹幕飞过

## 后端

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
