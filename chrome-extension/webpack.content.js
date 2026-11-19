const path = require('path');
const fs = require('fs-extra');
const CopyWebpackPlugin = require("copy-webpack-plugin");


module.exports = {
  entry: {
    content: './src/scripts/user-script.js',
    // background: './src/background.js'
  },
  output: {
    // dist/ for releases; npm run build:test sets BUILD_OUT to a folder in builds/.
    path: process.env.BUILD_OUT ? path.resolve(process.env.BUILD_OUT) : path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    clean: true
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "manifest.json", to: "." },  
        { from: "src/sw.js", to: "." }, 
        { from: "assets", to: "assets" },
        {from:"options.css", to:"."}
      ]
    })
  ]
};
