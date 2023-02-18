const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {preprocessor} = require("@flux/language-service/lib/webpack/preprocessor");

module.exports = {
  optimization: {
    usedExports: true,
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: 'single',
  },
  entry: {
    main: './src/main.ts',
    // fx_root: './src/components/fx-root.component.ts',
    // fx_metronome: './src/components/fx-metronome.component.ts',
    // fx_header: './src/components/fx-header.component.ts',
  },
  output: {
    path: path.resolve(__dirname, '../../dist/metronoman-flux'),
    filename: '[name].bundle.js',
    libraryTarget: 'umd',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.component.ts$/,
        exclude: /node_modules/,
        use: [
          './web-types.parser.js'
        ]
      },
      {
        test: /\.tsx?$/,
        use: [
          { loader: 'ts-loader' },
          // './web-types.parser.js'
        ],
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        use: [{
          loader: 'html-loader',
          options: {
            preprocessor: preprocessor,
          },
        }, './src/html-parser.js']

      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, 'src'),
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        exclude: [/\.styles.scss$/, /node_modules/],
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
      {
        test: /\.styles.scss$/,
        exclude: /node_modules/,
        use: [
          "sass-to-string",
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                outputStyle: "compressed",
              },
            },
          },
        ],
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.html'],
    modules: ['src', 'node_modules']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    // new BundleAnalyzerPlugin(),
    // new HtmlParserPlugin(),
  ],


}
