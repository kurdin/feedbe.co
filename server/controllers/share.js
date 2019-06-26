/* globals DB, globalHelper */

const CacheRedis = require('cacheman-redis');
const cache = new CacheRedis({ port: null, host: null });
const shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

const findShared = (sharedId, cb) => {
	if (!shortid.isValid(sharedId)) return cb(null);
	let noCache = !globalHelper.isDev ? true : false;
	let cacheTTL = noCache ? 0 : 10;
	let shared = [];
	let cacheKey = 'tryes6-shared-' + sharedId;

	cache.get(cacheKey, (err, data) => {
		if (data && !noCache) {
			shared = data;
		} else {
			shared = DB.sharedCodes.find({ id: sharedId });
			if (!noCache) cache.set(cacheKey, shared, cacheTTL);
		}
		cb(shared[0]);
	});
};

const addNewShared = (req, res) => {
	req.body.id = shortid.generate();
	let newCode = DB.sharedCodes.insert(req.body);
	DB.main.saveDatabase(err => {
		if (err) {
			console.log(err);
			res.status(500).json({ err });
		} else {
			console.log('saved to shared db code with new id: ', newCode.id);
			res.json({ status: 'ok', id: newCode.id });
		}
	});
};

exports.manage = {
	find: findShared,
	add: addNewShared
};
