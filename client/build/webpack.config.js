/* eslint-disable no-undef */
const path = require('path');

// 插件
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
const { HotModuleReplacementPlugin, DefinePlugin } = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

// custom

const paths = require('./paths');

module.exports = (env) => {
  const isProductionEnv = env && env.production ? true : false;
  const isDevelopmentEnv = !isProductionEnv;

  return {
    mode: isProductionEnv ? 'production' : 'development',
    target: 'web',

    entry: {
      app: './src/index.ts',
    },
    output: {
      filename: '[name].[hash].js',
      path: paths.outputPath,
    },
    devtool: isProductionEnv ? 'none' : 'inline-source-map',
    devServer: isProductionEnv
      ? undefined
      : {
          // contentBase: paths.outputPath, // ?
          // compress: true,
          host: '127.0.0.1',
          open: true,
          port: 3001,
          hot: true,
        },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          use: ['babel-loader'],
          //   include: paths.srcPath,
          exclude: /node_modules/,
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    // 插件
    plugins: [
      new HtmlWebpackPlugin({
        // 生成 html
        template: './public/index.html',
      }),
      new ProgressBarPlugin(), // 提供编译进度条
      new ForkTsCheckerWebpackPlugin(), // 提供编译时代码类型检查(异步)
      new DefinePlugin({
        // 注入变量
        __DEV__: isDevelopmentEnv ? true : false,
      }),
      ...(isDevelopmentEnv
        ? [
            // 开发模式下启用的插件
            new HotModuleReplacementPlugin(), // 热重启
          ]
        : []),
      ...(isProductionEnv
        ? [
            // 生产模式下启用的插件
            new CleanWebpackPlugin(), // 自动清理上一次编译的文件
            new BundleAnalyzerPlugin(), // 生产模式分析代码大小
          ]
        : []),
    ],
    resolve: {
      extensions: ['.js', '.ts', '.tsx', '.jsx', '.json'],
      alias: {
        // '@client': paths.srcPath,
        '@': paths.srcPath,
        ...(isDevelopmentEnv
          ? {
              'react-dom': '@hot-loader/react-dom', // 用于支持 react hooks 热重载
            }
          : {}),
      },
    },
  };
};
