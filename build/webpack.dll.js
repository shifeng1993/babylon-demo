const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    vender: ['@babylonjs/core', '@babylonjs/gui', '@babylonjs/loaders']
  },
  output: {
    path: path.join(__dirname, '../dll'),
    library: '[name]_dll', // 可以用名称来做对应的var name, 别人需要引用这个react变量
    // libraryTarget: 'commonjs2', // commonjs commonjs2 window this 最常用的一般是commonjs2
    filename: '[name].dll.js'
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]_dll',
      path: path.join(__dirname, '../dll', '[name].manifest.json'), // 增加映射关系
      context: path.join(__dirname, "src", "main")
    })
  ]
}