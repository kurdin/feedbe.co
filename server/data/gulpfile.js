const gulp = require('gulp');
const file = require('gulp-file');
const jsonServer = require('gulp-json-srv');

const server = jsonServer.create();

const db = {
	md: require('./md-providers-2018-9-23.json')
};

console.log('md database size', db.md.length);
gulp.task('start', function() {
	return file('this-is-actually-in-memory.js', JSON.stringify(db), { src: true }).pipe(server.pipe());
});
