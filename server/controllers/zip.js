/* globals DB, globalHelper, DB, render */

const Cacheman = require('cacheman');
const cache = new Cacheman({ prefix: 'PNO', ttl: 600, engine: 'redis' });

// const zipcodes = require('../lib/zipcodes');
// const Shared = require('./share').manage;

const index = async (req, res) => {
	const zip = req.params.zip;
	const view = 'zip-results';
	const cacheKey = 'db.providers/all';
	const noCache = !globalHelper.isDev || req.query.nocache !== undefined ? true : false;
	const cacheTTL = noCache ? 5 : 60;
	const zipData = await zipLookup(zip, req.query.nocache);
	let model = {
		shared: {
			zip,
			zipData,
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

const zipsAutoComplete = async (req, res) => {
	const zip = req.params.zip;
	// const radius = req.query.radius || 10;

	// if (!/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zip)) return res.json({ error: 'Invalid Zip Code' });

	// const zips = zipData.map(z => Number(z.zip));
	// let events = DB.events.find({ zip: { $in: zips } });

	// console.log('events', events);

	const zipData = await zipLookup(zip, req.query.nocache);
	res.json(zipData);
};

async function zipLookup(zip, nocache) {
	const lookup = zip && /^\d/.test(zip) ? zipcodes.lookup : zipcodes.lookupCity;

	const cacheKey = `zip/autocomplete/${zip}`;
	const noCache = globalHelper.isDev || nocache !== undefined ? true : false;
	const cacheTTL = noCache ? 5 : 60;

	let zipData = await cache.get(cacheKey);
	if (!zipData) {
		// zipData = zipcodes.radius(zip, radius, true);
		zipData = lookup(zip).slice(0, 50);
		await cache.set(cacheKey, zipData, cacheTTL);
	}
	return zipData;
}

module.exports = {
	index,
	zipsAutoComplete
};
