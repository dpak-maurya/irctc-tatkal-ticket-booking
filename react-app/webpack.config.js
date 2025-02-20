const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    app: "./src/index.js", // Entry point for the React app
  },
  output: {
    path: path.resolve(__dirname, "../dist"), // Unified output directory
    filename: "[name].bundle.js", // Generates app.bundle.js
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Transpile JS/JSX files
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/, // Add support for CSS files
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html", // Input HTML template
      filename: "options.html", // Output file (Chrome extension options page)
      chunks: ["app"], // Only include the React app in options.html
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "public", to: "public" }, // Public assets
      ],
    }),
  ],
  mode: "production", // Use 'development' for debugging
};
