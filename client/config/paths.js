const path = require('path');
const fs = require('fs');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/infernojs/create-inferno-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const envPublicUrl = process.env.PUBLIC_URL;
const getPublicUrl = appPackageJson => envPublicUrl || require(appPackageJson).homepage;

const nodePaths = (process.env.NODE_PATH || '')
  .split(process.platform === 'win32' ? ';' : ':')
  .filter(Boolean)
  .filter(folder => !path.isAbsolute(folder))
  .map(resolveApp);

// config after eject: we're in ./config/
module.exports = {
  dotenv: resolveApp('.env'),
  appBuild: resolveApp('server/public/apps/build'),
  appPublic: resolveApp('server/public'),
  appHtml: resolveApp('server/public/index.html'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('client/src/apps'),
  yarnLockFile: resolveApp('yarn.lock'),
  appNodeModules: resolveApp('node_modules'),
  publicUrl: getPublicUrl(resolveApp('package.json')),
  proxy: 'http://localhost:3000',
  root: resolveApp('../../'),
  appSrcRoot: resolveApp('client/src'),
  appPublicPath: 'apps/build',
  ownNodeModules: resolveApp('node_modules'),
  nodePaths: nodePaths
};
