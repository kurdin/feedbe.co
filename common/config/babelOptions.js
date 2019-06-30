// const production = globalHelper.isDev ? false : true;

module.exports = (clientSrc, rootPath) => {
	return {
		compact: false,
		presets: [
			[
				'@babel/preset-env',
				{
					loose: false,
					corejs: 3,
					useBuiltIns: 'entry',
					debug: false,
					targets: {
						node: 'current'
					}
				}
			],
			['@babel/react'],
			['@babel/typescript', { isTSX: true, allExtensions: true }]
		],
		plugins: [
			[
				'babel-plugin-root-import',
				// [
				{
					rootPathPrefix: '@client',
					rootPathSuffix: 'client/src'
				}
				// 	},
				// 	{
				// 		rootPathPrefix: '@apps',
				// 		rootPathSuffix: clientSrc + '/app'
				// 	}
				// ]
			],
			[
				'module-resolver',
				{
					// root: [clientSrc],
					alias: {
						inferno: 'react',
						'inferno-create-element': 'react',
						libs: clientSrc + '/libs',
						'jsx-filters': clientSrc + '/shared/jsx/filters',
						'shared/inferno': clientSrc + '/shared',
						'css/main': clientSrc + '/css',
						shared: clientSrc + '/shared',
						components: clientSrc + '/components',
						common: rootPath + '/common',
						services: rootPath + '/services',
						datalayer: rootPath + '/datalayer',
						queries: rootPath + '/services/queries'
					}
				}
			],
			'import-graphql',
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
		]
	};
};
