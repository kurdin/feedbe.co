process.env.NODE_ENV = 'production';
const c = require('ansi-colors');
const log = require('fancy-log');
const chalk = require('chalk');
const path = require('path');
const build = require('./build');
const fs = require('fs-extra');
const del = require('del');

const devClientSrcPath = path.join(__dirname, '../../../client/src');
const productionClientSrcPath = path.join(__dirname, '../../../.build/client/src');

const devServerSrcPath = path.join(__dirname, '../../');
const productionServerBuildPath = path.join(__dirname, '../../../.build/server');
const productionServerBuildIgnore = ['lib/**/*', 'data/**/*', 'public/**/*', 'views/**/*', 'db/**/*'];

const buildClient = () => {
  new Promise((resolve, reject) => {
    console.log("Coping client's development files to .build folder");
    fs.copySync(devClientSrcPath, productionClientSrcPath);
    console.log('Done!');
    console.log('Building JSX/JS/TS/TSX for production...');
    build(productionClientSrcPath, '', err => {
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

const buildServer = () =>
  new Promise((resolve, reject) => {
    console.log("Coping server's development files to .build folder");
    fs.copySync(devServerSrcPath, productionServerBuildPath);
    console.log('Done!');
    console.log('Building TS for production...');
    build(productionServerBuildPath, productionServerBuildIgnore, err => {
      if (err) {
        printErrors('Build TS Error', [err]);
        reject('Build TS Error', [err]);
      }
      log(c.green('TS Compiled Successfully.'));
      console.log();
      resolve();
    });
  });

const runBuild = async () => {
  try {
    log(c.green('Clearing .build folder'));
    await del([productionServerBuildPath], { force: true });
    log(c.green('Done!'));
    // await buildClient();
    await buildServer();
    log(c.green('All Builds Done Successfully!'));
    process.exit(0);
    // process.exit(0);
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
