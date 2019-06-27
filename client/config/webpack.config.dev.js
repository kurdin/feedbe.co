const autoprefixer = require('autoprefixer');
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
// const InterpolateHtmlPlugin = require('inferno-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getClientEnvironment = require('./env');

const paths = require('./paths');

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
// const publicPath = '/';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
const publicUrl = '';
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl);

var entryApps = {};
var dirs = [];
var files = fs.readdirSync(paths.appSrc);

files.forEach(function(file) {
  let full = path.join(paths.appSrc, file);
  if (fs.statSync(full).isDirectory() && file.indexOf('_off') === -1) dirs.push(file);
});

const webpackHotDevClientExcludeApp = 'vendors';

dirs.forEach((appname, i) => {
  let entry = [
    // require.resolve('./polyfills'),
    appname !== webpackHotDevClientExcludeApp ? require.resolve('react-dev-utils/webpackHotDevClient') : null,
    path.join(paths.appSrc, appname)
  ];

  entryApps[appname] = entry.filter(Boolean);
});

module.exports = {
  devtool: 'cheap-module-source-map',
  watch: false,
  mode: 'development',
  entry: entryApps,
  target: 'web',
  output: {
    publicPath: paths.appPublicPath,
    filename: 'js/[name]-bundle.js',
    chunkFilename: 'js/common/[name]-bundle.js',
    path: paths.appBuild,
    devtoolModuleFilenameTemplate: info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')
  },
  optimization: {
    splitChunks: {
      name: false,
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors-main',
          chunks: 'all'
        }
      }
    }
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      inferno: 'react',
      'inferno-create-element': 'react',
      // 'react-dom': 'preact-compat',
      libs: path.join(paths.appSrcRoot, './libs'),
      'jsx-filters': path.join(paths.appSrcRoot, './shared/jsx/filters'),
      'shared/inferno': path.join(paths.appSrcRoot, './shared'),
      'css/main': path.join(paths.appSrcRoot, './css'),
      shared: path.join(paths.appSrcRoot, './shared'),
      components: path.join(paths.appSrcRoot, './components')
    },
    plugins: [
      // Prevents users from importing files from outside of src/ (or node_modules/).
      // This often causes confusion because we only process files within src/ with babel.
      // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
      // please link the files into your node_modules/ and let module-resolution kick in.
      // Make sure your source files are compiled, as they will not be processed in any way.
      new ModuleScopePlugin(paths.appSrcRoot, [paths.appPackageJson])
    ]
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        enforce: 'pre',
        use: [
          {
            options: {
              formatter: eslintFormatter,
              eslintPath: require.resolve('eslint')
            },
            loader: require.resolve('eslint-loader')
          }
        ],
        exclude: /shared/,
        include: paths.appSrcRoot
      },
      {
        test: /\.(js|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        use: [require('./babelLoaders')('dev')],
        include: paths.appSrcRoot
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        loader: 'string-replace-loader',
        options: {
          search: ' class=',
          replace: ' className=',
          flags: 'g'
        }
      },
      // {
      //   test: /\.less$/,
      //   use: [
      //     'style-loader', // creates style nodes from JS strings
      //     'css-loader', // translates CSS into CommonJS
      //     'less-loader' // compiles Less to CSS
      //   ]
      // },
      {
        test: /\.css$/,
        use: [
          require.resolve('style-loader'),
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1
            }
          },
          {
            loader: require.resolve('postcss-loader'),
            options: {
              ident: 'postcss',
              parser: 'postcss-comment-2',
              plugins: () => [
                require('postcss-import'),
                require('postcss-simple-vars'),
                require('postcss-inline-svg'),
                require('css-mqpacker'),
                require('postcss-nested'),
                require('postcss-flexbugs-fixes'),
                autoprefixer({
                  flexbox: 'no-2009'
                }),
                require('cssnano')({
                  preset: 'default'
                })
              ]
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin(env.stringified),
    new CaseSensitivePathsPlugin(),
    new WatchMissingNodeModulesPlugin(paths.appNodeModules),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  // Turn off performance hints during development because we don't do any
  // splitting or minification in interest of speed. These warnings become
  // cumbersome.
  performance: {
    hints: false
  }
};
