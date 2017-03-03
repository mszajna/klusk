var path = require('path');
var webpack = require("webpack");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = (env) => ({
  entry: './src/client/index.js',
  output: {
    filename: 'client.js',
    path: path.resolve(__dirname, 'dist/client'),
    publicPath: '/client/'
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
          {loader: 'babel-loader'}
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
  devtool: 'inline-source-map'
});
