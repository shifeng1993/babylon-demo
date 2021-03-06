const merge = require('webpack-merge').merge;
const common = require('./webpack.common.js');
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

// App directory
const appDirectory = fs.realpathSync(process.cwd());


common.plugins.push( new webpack.DllReferencePlugin({
  context: path.join(__dirname, "src", "main"),
  manifest: require("../dll/vender.manifest.json")
}))

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.resolve(appDirectory, "public"),
    compress: true,
    hot: true,
    publicPath: '/',
    open: true,
    // host: '0.0.0.0', // enable to access from other devices on the network
    // https: true // enable when HTTPS is needed (like in WebXR)
  },
});