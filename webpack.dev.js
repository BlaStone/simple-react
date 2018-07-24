const merge = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const common = require('./webpack.common');

const DIST = path.resolve(__dirname, 'dist');
const SRC = path.resolve(__dirname, 'src');

module.exports = merge(common, {
  entry: {
    app: path.resolve(SRC, 'index.js'),
  },
  output: {
    path: DIST,
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        include: SRC
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
    }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'vendor'
    // })
  ],
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: DIST,
    port: 9999,
    // hot: true,
    // open: true,
  }
})