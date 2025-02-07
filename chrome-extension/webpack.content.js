const path = require('path');
const fs = require('fs-extra');
const CopyWebpackPlugin = require("copy-webpack-plugin");


module.exports = {
  entry: {
    content: './src/scripts/user-script.js',
    // background: './src/background.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'content.js',
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
        { from:"how-to-use.html", to:"."},
        {from:"options.css", to:"."}
      ]
    })
  ]
};
