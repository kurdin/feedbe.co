/* globals DB, globalHelper, render */

const CacheRedis = require('cacheman-redis');
const cache = new CacheRedis({ port: null, host: null });
// const Shared = require('./share').manage;

module.exports = (req, res) => {
	let view = 'index';
	let cacheKey = 'db.providers/all';
	let noCache = !globalHelper.isDev || req.query.nocache !== undefined ? true : false;
	let cacheTTL = noCache ? 0 : 60;
	let model = {
		shared: {
			csrfToken: req.csrfToken(),
			userEmail: req.user
		}
	};

	cache.get(cacheKey, (err, data) => {
		if (data && !noCache) {
			model.shared.providers = data;
		} else {
			model.shared.providers = DB.providers.find();
			if (!noCache) cache.set(cacheKey, model.shared.providers, cacheTTL);
		}

		render(view, model, res);
	});
};
