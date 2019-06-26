const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const ignoredFiles = require('react-dev-utils/ignoredFiles');
const config = require('./webpack.config.dev');
const paths = require('./paths');

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const host = process.env.HOST || 'localhost';

// console.log('config.output.publicPath', config.output.publicPath);

module.exports = function(proxy, allowedHost) {
	return {
		disableHostCheck: true,
		compress: true,
		clientLogLevel: 'none',
		contentBase: paths.appPublic,
		hot: true,
		watchContentBase: true,
		quiet: false,
		watchOptions: {
			ignored: ignoredFiles(paths.appSrc)
		},
		https: protocol === 'https',
		host: host,
		overlay: false,
		// historyApiFallback: {
		// 	disableDotRule: true
		// },
		historyApiFallback: true, // Allow refreshing of the page
		// public: allowedHost,
		publicPath: '/' + config.output.publicPath,
		proxy: {
			'**': paths.proxy
		},
		before(app) {
			// This lets us open files from the runtime error overlay.
			app.use(errorOverlayMiddleware());
			app.use(noopServiceWorkerMiddleware());
		}
	};
};
