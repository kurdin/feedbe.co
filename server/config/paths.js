var path = require('path');
var fs = require('fs');

var appDirectory = fs.realpathSync(process.cwd() + '/public/js');

// console.log('appDirectory', appDirectory);
function resolveApp(relativePath) {
  return path.resolve(appDirectory, relativePath);
}

var nodePaths = (process.env.NODE_PATH || '')
  .split(process.platform === 'win32' ? ';' : ':')
  .filter(Boolean)
  .filter(folder => !path.isAbsolute(folder))
  .map(resolveApp);

module.exports = {
  proxy: 'http://localhost:3000',
  root: resolveApp('../../'),
  appRoot: resolveApp('apps'),
  appBuild: resolveApp('build'),
  appPublicPath: 'js/build',
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('apps'),
  testsSetup: resolveApp('src/setupTests.js'),
  appNodeModules: resolveApp('node_modules'),
  ownNodeModules: resolveApp('node_modules'),
  nodePaths: nodePaths
};
