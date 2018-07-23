const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: path.join(__dirname, 'src/index.js'),
  },
  output: {
    path: path.join(__dirname, './dist'),
    filename: '[name]bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        use: [
          'babel-loader'
        ],
        include: path.join(__dirname, 'src')
      },
      {
        test: /.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          }
        ],
        include: path.join(__dirname, 'src')
      }
    ]
  }
}