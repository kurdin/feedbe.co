const fs = require('fs');
let cache = {};

function isExist(path, callback) {
	// Async
	if (typeof callback === 'function') {
		fs.stat(path, function(err) {
			callback(!err);
		});
		return isExist;
	}

	// Sync
	try {
		// fs.statSync(path);
		fs.accessSync(path, fs.F_OK);
		return true;
	} catch (err) {
		return false;
	}
}

module.exports = {
	inCache: cache,
	isExist: isExist
};
