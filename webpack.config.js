const path = require('path');
const common = require('./webpack.common');
const merge = require('webpack-merge');

module.exports = merge(common, {
  devtool: 'sourece-map',
  devServe: {
    port: 9000,
    contentBase: path.join(__dirname, './dist'),
    historyApiFallback: true,
    hot: true,
    // host: '0.0.0.0'
  }
})