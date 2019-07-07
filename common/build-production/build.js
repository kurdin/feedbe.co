const async = require('async');
const path = require('path');
const glob = require('glob');
const convert = require('./convert');

module.exports = (folderToBuild, location, ignore, cb) => {
	var fn = [];
	var totalFiles;
	var locationsFinished = 0;

	glob(
		'**/*.{tsx,ts,js,jsx}',
		{
			cwd: location,
			ignore
		},
		(err, files) => {
			if (err) {
				return cb(err);
			}
			totalFiles = files.length;

			console.log(`Total files to build in : ${folderToBuild}`, totalFiles);
			files.forEach(file => {
				const filePath = path.join(path.join(location, file));
				const filePathJS = path.join(path.join(location, file.replace(/\.(jsx|js|tsx|ts)$/, '.js')));
				fn.push(cb => {
					console.log('Building file in ' + folderToBuild + '/' + file);
					convert(filePath, filePathJS);
					return cb(null, filePathJS);
				});
			});

			async.parallelLimit(fn, 10, (err, location) => {
				if (err) {
					return cb(err);
				}
				locationsFinished++;
				if (locationsFinished === totalFiles) cb(null);
			});
		}
	);
};
