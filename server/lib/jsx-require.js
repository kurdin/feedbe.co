/* global clientSrc */

const pirates = require('pirates');
const babel = require('@babel/core');

const babelOptions = require('../config/babelOptionsServer')(clientSrc);

const loaders = {
	babel: function(source) {
		return babel.transform(source, babelOptions).code;
	}
};

function convertJS(source, filename) {
	if (filename.includes('/server/')) return source;
	// console.log('JS(X) FOUND: ' + filename);
	return loaders.babel(source);
}

function convertCss(source, filename) {
	// console.log('Css found: ' + filename);
	return 'module.exports = {};';
}

var hooks = [
	pirates.addHook(convertJS, { exts: ['.js', '.tsx', '.jsx'] }),
	pirates.addHook(convertCss, { exts: ['.css'] })
];

module.exports = function unhook() {
	hooks.forEach(function(h) {
		h.unhook();
	});
};
