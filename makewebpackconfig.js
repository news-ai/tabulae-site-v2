var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
// var AppCachePlugin = require('appcache-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CompressionPlugin = require('compression-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// var SentryPlugin = require('webpack-sentry-plugin');

module.exports = function(options) {
  var entry, plugins, cssLoaders;

  // If production is true
  if (options.prod) {
    entry = [
      'babel-polyfill',
      path.resolve(__dirname, 'js/app.js')
    ];
    cssLoaders = ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        { loader: 'css-loader', options: {sourceMap: true, importLoaders: 1} },
        { loader: 'postcss-loader' },
        { loader: 'sass-loader' }
      ]
    });
    plugins = [
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new webpack.optimize.UglifyJsPlugin({
        mangle: true,
        unused: true,
        dead_code: true,
        drop_debugger: true,
        evaludate: true,
        drop_console: true,
        sequences: true,
        booleans: true,
        compress: { warnings: false },
        sourcemap: true,
        // comments: false,
        // sourceMap: true,
        // minimize: false,
        exclude: [/\.min\.js$/gi]
      }),
      new HtmlWebpackPlugin({
        template: 'index.html',
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true
        },
        inject: true,
        favicon: 'favicon.ico',
      }),
      new ExtractTextPlugin('css/main.css'),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production'),
          CIRCLE_SHA1: JSON.stringify(process.env.CIRCLE_SHA1),
          MIXPANEL_TOKEN: JSON.stringify('f723102b5c5ab2931d4ec00b84f1d166')
        },
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
      new CompressionPlugin({
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        test: /\.js$|\.css$|\.html$/,
        threshold: 10240,
        minRatio: 0
      }),
      // new BundleAnalyzerPlugin()
    ];
  } else {
    entry = [
      'webpack-dev-server/client?http://localhost:3000',
      'webpack/hot/only-dev-server',
      path.resolve(__dirname, 'js/app.js')
    ];
    cssLoaders = [
      'style-loader',
      { loader: 'css-loader' },
      { loader: 'postcss-loader' },
      { loader: 'sass-loader' }
    ];
    plugins = [
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        template: 'index.html',
        inject: true,
        favicon: 'favicon.ico',
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('development'),
          MIXPANEL_TOKEN: JSON.stringify('1246b6942fbd12b5bc7839a7a77f0330')
        },
      }),
    ];
  }

  return {
    bail: true,
    devtool: options.prod ? 'hidden-source-map' : 'eval-cheap-module-source-map',
    entry: entry,
    output: { // Compile into js/build.js
      path: path.resolve(__dirname, 'build'),
      filename: options.prod ? 'js/bundle.[hash].js' : 'js/bundle.js',
      publicPath: '/',
      sourceMapFilename: '[name].js.map'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          use: 'babel-loader',
          exclude: path.join(__dirname, '/node_modules/')
        },
        {
          test: /\.css$/,
          use: cssLoaders
        },
        {
          test: /\.jpe?g$|\.gif$|\.png$/i,
          use: [
            {
              loader: 'url-loader',
              options: {limit: 10000}
            }
          ]
        }
      ]
    },
    resolve: {
      extensions: ['.json', '.jsx', '.js'],
      alias: {
        'node_modules': __dirname + '/node_modules',
        'img': __dirname + '/img',
        'constants': __dirname + '/js/constants',
        'actions': __dirname + '/js/actions',
        'components': __dirname + '/js/components',
        'reducers': __dirname + '/js/reducers',
        'utils': __dirname + '/js/utils',
        moment$: 'moment/moment.js',
      }
    },
    plugins: plugins,
    target: 'web', // Make web variables accessible to webpack, e.g. window
  };
};
