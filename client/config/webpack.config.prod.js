const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
// const InterpolateHtmlPlugin = require('inferno-dev-utils/InterpolateHtmlPlugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const url = require('url');
const paths = require('./paths');
const fs = require('fs');
const getClientEnvironment = require('./env');

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
const publicPath = paths.servedPath;
// Some apps do not use client-side routing with pushState.
// For these, "homepage" can be set to "." to enable relative asset paths.
// const shouldUseRelativeAssetPaths = publicPath === './';
// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
// const publicUrl = publicPath.slice(0, -1);
// Get environment variables to inject into our app.
// const env = getClientEnvironment(publicUrl);

function ensureSlash(path, needsSlash) {
  var hasSlash = path.endsWith('/');
  if (hasSlash && !needsSlash) {
    return path.substr(path, path.length - 1);
  } else if (!hasSlash && needsSlash) {
    return path + '/';
  } else {
    return path;
  }
}

// We use "homepage" field to infer "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
var homepagePath = '/';
var homepagePathname = homepagePath ? url.parse(homepagePath).pathname : '/';
// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
var publicUrl = ensureSlash(homepagePathname, false);
// Get environment variables to inject into our app.
var env = getClientEnvironment(publicUrl);

var entryApps = {};
var dirs = [];
var files = fs.readdirSync(paths.appSrc);

files.forEach(function(file) {
  let full = path.join(paths.appSrc, file);
  if (fs.statSync(full).isDirectory() && file.indexOf('_off') === -1) dirs.push(file);
});

dirs.forEach(function(appname) {
  entryApps[appname] = [
    //require.resolve('./polyfills'),
    path.join(paths.appSrc, appname)
  ];
});
// Assert this just to be safe.
if (env.stringified['process.env'].NODE_ENV !== '"production"') {
  throw new Error('Production builds must have NODE_ENV=production.');
}

module.exports = {
  // Don't attempt to continue if there are any errors.
  bail: true,
  stats: 'errors-only',
  mode: 'production',
  // We generate sourcemaps in production. This is slow but gives good results.
  // You can exclude the *.map files from the build during deployment.
  devtool: shouldUseSourceMap ? 'source-map' : false,
  // In production, we only want to load the polyfills and the app code.
  entry: entryApps,
  target: 'web',
  output: {
    // The build folder.
    path: paths.appBuild,
    // Generated JS file names (with nested folders).
    // There will be one main bundle, and one file per asynchronous chunk.
    // We don't currently advertise code splitting but Webpack supports it.
    filename: 'js/[name]-bundle-[chunkhash:5].js',
    chunkFilename: 'js/[name]-bundle-[chunkhash:5].js',

    // filename: '[name].[chunkhash:8].js',
    // chunkFilename: '[name].[chunkhash:8].chunk.js',
    // We inferred the "public path" (such as / or /my-project) from homepage.
    publicPath: publicPath
  },
  performance: {
    maxEntrypointSize: 1000000,
    maxAssetSize: 1000000
  },
  resolve: {
    // This allows you to set a fallback for where Webpack should look for modules.
    // We placed these paths second because we want `node_modules` to "win"
    // if there are any conflicts. This matches Node resolution mechanism.

    modules: ['node_modules', paths.appNodeModules].concat(
      // It is guaranteed to exist because we tweak it in `env.js`
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
    // These are the reasonable defaults supported by the Node ecosystem.
    // We also include JSX as a common component filename extension to support
    // some tools, although we do not recommend using it, see:
    // `web` extension prefixes have been added for better support
    // for React Native Web.
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      inferno: 'react',
      'inferno-create-element': 'react',
      libs: path.join(paths.appSrcRoot, './libs'),
      'jsx-filters': path.join(paths.appSrcRoot, './shared/jsx/filters'),
      'shared/inferno': path.join(paths.appSrcRoot, './shared'),
      'css/main': path.join(paths.appSrcRoot, './css'),
      shared: path.join(paths.appSrcRoot, './shared'),
      components: path.join(paths.appSrcRoot, './components')
      // Use production build of inferno
      // inferno: path.resolve(require.resolve('inferno/dist/index.esm.js'))
    },
    plugins: [new ModuleScopePlugin(paths.appSrcRoot, [paths.appPackageJson])]
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
        include: paths.appSrcRoot,
        use: [require('./babelLoaders')('production')]
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
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },

          {
            loader: 'css-loader'
          },

          {
            loader: 'postcss-loader',
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
      // {
      //   loader: require.resolve('file-loader'),
      //   exclude: [/\.(js|jsx|tsx|ts|mjs)$/, /\.html$/, /\.json$/],
      //   options: {
      //     name: 'static/media/[name].[hash:8].[ext]'
      //   }
      // }
    ]
  },
  optimization: {
    splitChunks: {
      name: false,
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'common/vendors-main',
          chunks: 'all'
        }
      }
    },
    minimize: true,
    minimizer: [
      // we specify a custom UglifyJsPlugin here to get source maps in production
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
          compress: false,
          ecma: 6,
          mangle: true
        },
        sourceMap: shouldUseSourceMap
      })
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery'
    }),
    new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name]-bundle-[chunkhash:5].css'
    }),
    new ManifestPlugin({
      fileName: 'apps-asset-manifest.json',
      map: file => {
        const extension = path.extname(file.name).slice(1);
        const name = file.name.split('.')[0];

        return {
          ...file,
          name: ['css', 'js'].includes(extension) ? `${extension}/${name}-bundle.${extension}` : file.name
        };
      }
    }),
    // Generate a service worker script that will precache, and keep up to date,
    // the HTML & assets that are part of the Webpack build.
    // new SWPrecacheWebpackPlugin({
    // By default, a cache-busting query parameter is appended to requests
    // used to populate the caches, to ensure the responses are fresh.
    // If a URL is already hashed by Webpack, then there is no concern
    // about it being stale, and the cache-busting can be skipped.
    //   dontCacheBustUrlsMatching: /\.\w{8}\./,
    //   filename: 'service-worker.js',
    //   logger(message) {
    //     if (message.indexOf('Total precache size is') === 0) {
    //       // This message occurs for every build and is a bit too noisy.
    //       return;
    //     }
    //     if (message.indexOf('Skipping static resource') === 0) {
    //       // This message obscures real errors so we ignore it.
    //       // https://github.com/facebookincubator/create-react-app/issues/2612
    //       return;
    //     }
    //     console.log(message);
    //   },
    //   minify: true,
    //   // For unknown URLs, fallback to the index page
    //   navigateFallback: publicUrl + '/',
    //   // Ignores URLs starting from /__ (useful for Firebase):
    //   // https://github.com/facebookincubator/create-react-app/issues/2237#issuecomment-302693219
    //   navigateFallbackWhitelist: [/^(?!\/__).*/],
    //   // Don't precache sourcemaps (they're large) and build asset manifest:
    //   staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/]
    // }),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
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
  }
};
