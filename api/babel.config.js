const babelOptions = require('../server/config/babelOptionsServer');
const clientSrc = require('path').resolve(__dirname + '/../client/src');
module.exports = babelOptions(clientSrc);
