const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js', // Entry point for the React app
  output: {
    path: path.resolve(__dirname, 'dist/build'), // Output directory for bundled files
    filename: 'bundle.js', // Output file name
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Transpile JS/JSX files
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/, // Add support for CSS files
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // Input HTML template
      filename: 'options.html', // Output file (Chrome extension)
    }),
  ],
  mode: 'production', // Can be changed to 'production' for final build
};
