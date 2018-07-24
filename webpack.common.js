const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const webpack = require('webpack');

const SRC = path.resolve('src');
const DIST = path.resolve(__dirname, 'dist');

module.exports = {
  entry: {
    app: path.resolve(SRC, 'index.js'),
    // vendor: ['react', 'react-dom']
  },
  output: {
    path: DIST,
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        use: [
          'babel-loader?cacheDirectory=true'
        ],
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
}