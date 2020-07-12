const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');

// App 目录
const appDirectory = fs.realpathSync(process.cwd());

module.exports = {
  entry: path.resolve(appDirectory, "src/index.ts"),
  output: {
    filename: 'js/babylonBundle.js',
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [{
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      loader: 'source-map-loader',
      enforce: 'pre',
    },
    {
      test: /\.tsx?$/,
      loader: 'ts-loader'
    },
    {
      test: /\.(png|jpg|gif|env|glb|stl|babylon)$/i,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 8192,
        },
      },],
    }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(appDirectory, "public/index.html"),
    }),
  ],
  // Just for ammo
  node: {
    fs: 'empty'
  }
}