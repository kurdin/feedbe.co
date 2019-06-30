const babelOptions = require('./common/config/babelOptions');
const clientSrc = require('path').resolve(__dirname + '/client/src');
const rootPath = require('path').resolve(__dirname);
module.exports = babelOptions(clientSrc, rootPath);
