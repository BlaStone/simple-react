const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const common = require('./webpack.common');

const SRC = path.resolve(__dirname, 'src');
const DIST = path.resolve(__dirname, 'dist');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        }),
        exclude: DIST
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new UglifyJSPlugin(),
    // new webpack.DefinePlugin({
    //   'process.env'
    // })
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'vendor'
    // }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'runtime'
    // }),
    new ExtractTextPlugin({
      filename: '[name].[contenthash:5].css',
      allChunks: true
    })
  ]
})