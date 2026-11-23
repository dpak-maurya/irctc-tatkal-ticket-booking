const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    app: "./src/index.js", // Entry point for the React app
    guide: "./src/guide.js", // How to Use guide
  },
  output: {
    // dist/ for releases; npm run build:test sets BUILD_OUT to a folder in builds/.
    path: process.env.BUILD_OUT ? path.resolve(process.env.BUILD_OUT) : path.resolve(__dirname, "../dist"),
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
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "how-to-use.html", // Opened from the header's How to Use button
      chunks: ["guide"],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "public", to: "public" }, // Public assets
      ],
    }),
  ],
  mode: "production", // Use 'development' for debugging
};
