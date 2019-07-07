process.env.NODE_ENV = 'production';
const c = require('ansi-colors');
const log = require('fancy-log');
const chalk = require('chalk');
const path = require('path');
const build = require('./build');
const fs = require('fs-extra');
const del = require('del');

const rootPath = path.join(__dirname, '../../');

const devClientSrcPath = rootPath + 'client/src';
const productionClientSrcPath = rootPath + '.build/client/src';

const devPathsToBuild = [
  { path: 'client/src', ignore: [] },
  {
    path: 'server',
    ignore: ['sandbox.console.re/**/*', 'lib/**/*.js', 'data/**/*', 'public/**/*', 'views/**/*', 'db/**/*']
  },
  { path: 'common', ignore: [] },
  { path: 'datalayer', ignore: ['db-local/**/*'] },
  { path: 'services', ignore: [] }
];

const productionBuildPath = rootPath + '.build/';

const buildClient = () => {
  new Promise((resolve, reject) => {
    console.log("Coping client's development files to .build folder");
    fs.copySync(devClientSrcPath, productionClientSrcPath);
    console.log('Done!');
    console.log('Building JSX/JS/TS/TSX for production...');
    build(productionClientSrcPath, productionClientSrcPath, '', err => {
      if (err) {
        printErrors('Build JSX/JS/TS/TSX Error', [err]);
        reject('Build JSX/JS/TS/TSX Error', [err]);
      }
      console.log(chalk.green('JSX/JS/TS/TSX Compiled Successfully.'));
      console.log();
      resolve();
    });
  });
};

const buildServer = () => {
  const allBuilds = [];
  for (const folder of devPathsToBuild) {
    const { path, ignore } = folder;
    console.log(`Coping development files from ${path} to .build/${path} folder`);
    fs.copySync(rootPath + path, rootPath + '.build/' + path);
    console.log('Done!');
    console.log(`Building TS in ${'.build/' + path} for production...`);
    allBuilds.push(
      new Promise((resolve, reject) => {
        console.log("Coping server's development files to .build folder");
        build('.build/' + path, rootPath + '.build/' + path, ignore, err => {
          if (err) {
            printErrors('Build TS Error', [err]);
            reject('Build TS Error', [err]);
          }
          log(c.green('TS Compiled Successfully.'));
          console.log();
          resolve();
        });
      })
    );
  }
  return Promise.all(allBuilds);
};

const runBuild = async () => {
  try {
    log(c.green('Clearing .build folder'));
    await del([productionBuildPath], { force: true });
    log(c.green('Done!'));
    // await buildClient();
    await buildServer();
    log(c.green('All Builds Done Successfully!'));
    process.exit(0);
  } catch (e) {
    log(c.red(e));
    process.exit(1);
  }
};

runBuild();

function printErrors(summary, errors) {
  console.log(chalk.red(summary));
  console.log();
  errors.forEach(err => {
    console.log(err.message || err);
    console.log();
  });
}
