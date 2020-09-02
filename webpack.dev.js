const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');


// const path = require('path');
// const NodeExternals = require('webpack-node-externals');
// const NodemonNgrokWebpackPlugin = require('nodemon-ngrok-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map'
  // externals: [NodeExternals()],
  // plugins: [
  //   // Where the magic happens
  //   new NodemonNgrokWebpackPlugin()
  // ],
});
