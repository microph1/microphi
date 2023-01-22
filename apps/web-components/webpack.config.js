const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: 'development',
  optimization: {
    usedExports: true
  },
  entry: './src/main.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
        },
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        use: {
          loader: 'html-loader',
          options: {
            // esModule: true,
          }
        }

      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, 'src'),
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.html'],
    modules: ['src', 'node_modules']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
  ],
  devtool: 'source-map',
}
