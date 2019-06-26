const c = require('ansi-colors');
const nodemon = require('gulp-nodemon');
const log = require('fancy-log');
const dust = require('gulp-dust');
const extReplace = require('gulp-ext-replace');
const del = require('del');
const webpack = require('webpack');
const { series } = require('gulp');
const gulp = require('gulp');
const revRewrite = require('gulp-rev-rewrite');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const rev = require('gulp-rev');
const path = require('path');

const CssProcessors = [
	require('postcss-import'),
	require('postcss-simple-vars'),
	require('postcss-inline-svg'),
	require('css-mqpacker'),
	require('postcss-nested'),
	require('postcss-flexbugs-fixes'),
	autoprefixer({
		browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 11'],
		flexbox: 'no-2009'
	}),
	cssnano({
		preset: 'default'
	})
];

function infernoWebpack(cb) {
	require('./client/scripts/start');
	cb();
}

function nodemonServer(cb) {
	let started = false;
	nodemon({
		script: './index.js',
		watch: [
			'./server/server.ts',
			'./server/types',
			'./server/controllers',
			'./server/routes',
			'./server/models',
			'./server/views',
			'./server/pages'
		],

		// ignore: [
		//          'apps/src',
		//          'node_modules'
		//      ],
		env: {
			NODE_ENV: 'development'
		},
		ext: 'html dust js ts tsx jsx'
	})
		.on('change')
		.on('start', function() {
			if (!started) {
				cb();
				started = true;
			}
		})
		.on('restart', function() {
			log(c.green('Server app restarted!'));
		})
		.on('crash', function() {
			log.error(c.red('Server app crashed'));
			// process.exit(-1);
		});
}

function nodemonServerApi(cb) {
	let started = false;
	nodemon({
		script: './api/index.js',
		watch: ['./api/src'],
		// ignore: [
		//          'apps/src',
		//          'node_modules'
		//      ],
		env: {
			NODE_ENV: 'development'
		},
		ext: 'js ts'
	})
		.on('change')
		.on('start', function() {
			if (!started) {
				cb();
				started = true;
			}
		})
		.on('restart', function() {
			log(c.green('API Server restarted!'));
		})
		.on('crash', function() {
			log.error(c.red('API Server crashed'));
			// process.exit(-1);
		});
}

gulp.task('cssWatch', () => {
	return gulp.watch('./client/css/**/*.css', gulp.series('cssBuildDev'));
});

gulp.task('cssBuildDev', () => {
	return gulp
		.src('./client/css/index.css')
		.pipe(sourcemaps.init())
		.pipe(postcss(CssProcessors))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('./server/public/site/css/build'));
});

gulp.task('cssBuildProduction', async () => {
	await del(['./server/public/site/css/build'], { force: true });
	return gulp
		.src('./client/css/index.css')
		.pipe(postcss(CssProcessors))
		.pipe(rev())
		.pipe(gulp.dest('./server/public/site/css/build'))
		.pipe(
			rev.manifest({
				path: path.resolve('css-manifest.json')
			})
		)
		.pipe(gulp.dest('./server/public/site/css/build'));
});

gulp.task('setProdNodeEnv', cb => {
	process.env.GENERATE_SOURCEMAP = false;
	process.env.NODE_ENV = 'production';
	cb();
});

gulp.task('dustBuild', async () => {
	await del(['./server/.build/views'], { force: true });
	return gulp
		.src('./server/views/**/*.dust')
		.pipe(dust())
		.pipe(extReplace('.js'))
		.pipe(
			revRewrite({
				manifest: gulp.src([
					'server/public/apps/build/apps-asset-manifest.json',
					'server/public/site/css/build/css-manifest.json'
				])
			})
		)
		.pipe(gulp.dest('./server/.build/views'));
});

gulp.task('webpackBuild', async cb => {
	await del(['./server/public/apps/build/'], { force: true });
	const webpackConfigProd = require('./client/config/webpack.config.prod.js');

	return new Promise(function(resolve, reject) {
		webpack(webpackConfigProd, (err, stats) => {
			if (stats.hasErrors()) {
				log.error(
					stats.toString({
						chunks: false,
						colors: true
					})
				);
				log.error(c.red('[webpack build has errors]'));
				reject();
				process.exit(-1);
			}

			log(
				stats.toString({
					colors: true
				})
			);
			log(c.green('[webpack build completed successful]'));
			resolve();
		});
	});
});

exports.api = series(nodemonServerApi);
exports.build = series('setProdNodeEnv', 'cssBuildProduction', 'webpackBuild', 'dustBuild');
exports.default = series(infernoWebpack, 'cssBuildDev', nodemonServer, 'cssWatch');
exports.server = nodemonServer;
exports.webpackdev = infernoWebpack;
exports.dustbuild = 'dustBuild';
exports.webpackbuild = series('setProdNodeEnv', 'webpackBuild');
