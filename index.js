const path = require('path');
const rootPath = path.join(__dirname, './');

require('@babel/register')({
	root: rootPath,
	ignore: [/node_modules/, /lib/],
	only: [rootPath],
	extensions: ['.js', '.jsx', '.ts', '.tsx'],
	cache: true
});
// require('@babel/polyfill');
require('./server/server.ts');
// require('./api/index');
