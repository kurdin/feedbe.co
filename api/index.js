const path = require('path');
const rootPath = path.join(__dirname, './');

require('@babel/register')({
	root: rootPath,
	ignore: [/node_modules/, /lib/],
	extensions: ['.js', '.jsx', '.ts', '.tsx'],
	cache: true
});
require('./src/server-graphql');
