const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const NodeSassMagicImporter = require('node-sass-magic-importer');
const OpenBrowser = require('./www/lib/open-browser');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');
const Serve = require('webpack-serve');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

const paths = {
  'www': path.join(__dirname, 'www'),
  'dist': path.join(__dirname, 'www', 'dist'),
  'src': path.join(__dirname, 'www', 'src'),
};

module.exports = (env, argv) => {

  let config = {
    entry: path.join(paths.src, 'main.js'),
    mode: argv.mode,
    devtool: false,

    output: {
      publicPath: '',
      path: paths.www,
      filename: 'dist/' + (isDevMode(argv) ? '[name].min.js' : '[name].[hash].min.js'),
    },

    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },

        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: [paths.src],
        },

        {
          test: /\.css$/,
          use: [
            isDevMode(argv) ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
          ],
        },

        {
          test: /\.scss$/,
          use: [
            isDevMode(argv) ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                importer: NodeSassMagicImporter(),
              },
            },
          ],
        },

        {
          test: /\.(ttf|eot|woff|woff2|png|jpg|svg)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'dist/fonts/',
              publicPath: (isDevMode(argv) ? 'dist/' : '') + 'fonts/',
            },
          },
        },
      ],
    },

    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
          },
        },
      },
    },

    resolve: {
      extensions: ['.js', '.vue'],
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
      },
    },

    plugins: [
      new CleanWebpackPlugin([paths.dist, path.join(paths.www, 'build.html')], {
        dry: false,
      }),
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        filename: path.join(paths.www, 'build.html'),
        template: path.join(paths.src, 'template.html'),
        inject: true,
        minify: isDevMode(argv) ? false : {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
        },
      }),
    ],
  };

  if (!isDevMode(argv)) {
    config.plugins.push(new MiniCssExtractPlugin({
      filename: 'dist/' + (isDevMode(argv) ? '[name].min.css' : '[name].[hash].min.css'),
      chunkFilename: 'dist/' + (isDevMode(argv) ? '[name].min.css' : '[name].[hash].min.css'),
    }));

    config.optimization.minimizer = [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
      }),
      new OptimizeCSSAssetsPlugin(),
    ];
  }


  if (isDevMode(argv)) {
    config.devtool = 'cheap-module-eval-source-map';

    Serve({ config }).then((server) => {
      server.on('listening', () => {
        OpenBrowser(`http://${server.options.host}:${server.options.port}/build.html`);
      });
    });
  }

  function isDevMode(argv) {
    return argv.mode === 'development';
  }

  return config;
};
