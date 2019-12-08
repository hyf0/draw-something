/* eslint-disable no-undef */
const path = require('path');

// 插件
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
const { HotModuleReplacementPlugin, DefinePlugin } = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// custom

const paths = require('./paths');

module.exports = env => {
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
    devServer: isProductionEnv ? undefined : {
      // contentBase: paths.outputPath, // ?
      // compress: true,
      host: '0.0.0.0',
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
          exclude: /node_modules/,

        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
          exclude: /node_modules/,
        },
      ],
    },
    // 插件
    plugins: [
      new CleanWebpackPlugin(), // 自动清理上一次编译的文件
      new HtmlWebpackPlugin({ // 生成 html
        template: './public/index.html'
      }),
      new ProgressBarPlugin(), // 提供编译进度条
      new ForkTsCheckerWebpackPlugin(),
      new DefinePlugin({ // 注入变量
        __DEV__: isDevelopmentEnv ? true : false,
      }),
      isDevelopmentEnv ? new HotModuleReplacementPlugin() : undefined, // 开发模式开启 热重启
      isProductionEnv ? new BundleAnalyzerPlugin() : undefined, // 生产模式分析代码大小
    ].filter(Boolean),
    resolve: {
      extensions: [".ts", ".tsx", ".jsx", ".js", ".json"],
      alias: {
        // '@client': paths.srcPath,
        '@': paths.srcPath,
        'shared': path.resolve(paths.rootPath, 'shared'),
        ...(isDevelopmentEnv ? {
          'react-dom': '@hot-loader/react-dom' // 用于支持 react hooks 热重载
        } : {})
      }
    }
  }
}
