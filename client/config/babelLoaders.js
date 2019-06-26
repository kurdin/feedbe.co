module.exports = function(env) {
  let production = env === 'production' ? true : false;
  let browsers = production
    ? ['> 1%', 'ie >= 11', 'safari > 10']
    : [
        'last 2 Chrome versions',
        'last 2 Firefox versions',
        'last 2 Edge versions',
        'last 2 Opera versions',
        'last 2 Safari versions'
      ];
  return {
    loader: 'babel-loader',
    options: {
      babelrc: false,
      compact: false,
      ignore: [/\/core-js/],
      sourceType: 'unambiguous',
      presets: [
        [
          '@babel/preset-env',
          {
            loose: !production,
            corejs: 3,
            modules: false,
            useBuiltIns: 'usage',
            debug: !production,
            targets: {
              browsers
            }
          }
        ],
        // '@babel/react',
        // [
        //   'react-app',
        //   {
        //     flow: false,
        //     typescript: true
        //   }
        // ]
        ['@babel/react'],
        ['@babel/typescript', { isTSX: true, allExtensions: true }]
      ],
      plugins: [
        '@babel/plugin-proposal-object-rest-spread',
        [
          '@babel/plugin-transform-runtime',
          {
            regenerator: true
          }
        ],
        '@babel/plugin-syntax-dynamic-import',
        '@wordpress/babel-plugin-import-jsx-pragma',
        '@babel/plugin-proposal-export-default-from',
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        '@babel/plugin-transform-async-to-generator',
        ['@babel/plugin-proposal-class-properties', { loose: true }]
      ],
      cacheDirectory: !production,
      cacheCompression: false
    }
  };
};
