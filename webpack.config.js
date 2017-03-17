var path = require('path');
var webpack = require("webpack");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var nodeExternals = require('webpack-node-externals');

module.exports = (env) => [{
  entry: './src/server/index.js',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'dist/server')
  },
  plugins: [
    new webpack.BannerPlugin({banner: '#!/usr/bin/env node\nrequire("source-map-support").install();', raw: true})
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {loader: 'babel-loader'},
          {loader: 'eslint-loader'}
        ]
      }
    ]
  },
  devtool: 'inline-source-map'
}, {
  entry: './src/client/index.js',
  output: {
    filename: 'client.js',
    path: path.resolve(__dirname, 'dist/client')
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Klusk',
      template: 'src/client/index.html'
    }),
    new ExtractTextPlugin('styles.css')
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {loader: 'babel-loader'},
          {loader: 'eslint-loader'}
        ]
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {loader: 'css-loader', options: {sourceMap: true}}
          ]
        })
      }
    ]
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist/client'),
  },
  devtool: 'inline-source-map'
}];
