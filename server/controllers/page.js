/* globals globalHelper, render, appRoot */

const fs = require('fs-extra');
const path = require('path');
const marked = require('marked');
const CacheRedis = require('cacheman-redis');
const matter = require('gray-matter');
const cache = new CacheRedis({ port: null, host: null });

marked.setOptions({
	renderer: new marked.Renderer(),
	gfm: true,
	tables: true,
	breaks: false,
	pedantic: false,
	sanitize: false,
	smartLists: true,
	smartypants: false
});

var siteRoot = appRoot + '/pages/';

module.exports = (req, res) => {
	if (path.extname(req.originalUrl) !== '') return res.status(404).render('error', { url: req.originalUrl });

	let view = 'page';
	let model = {};
	// let lang = req.session.locale !== 'en' ? '.' + req.session.locale : null;
	model.noaside = true;

	model.user = req.user;
	model.shared = {
		_csrf: res.locals._csrf
	};

	// let fileName = req.params.file ? path.join(siteRoot, req.params.file + '.md') : null;
	let name = req.params.file ? path.join(siteRoot, req.params.file) : null;
	let fileName;

	try {
		if (!name) throw new Error();
		let stat = fs.statSync(name);
		if (stat.isDirectory()) {
			fileName = path.join(name, 'index.md');
			fs.statSync(fileName);
		} else throw new Error();
	} catch (err) {
		fileName = name + '.md';
		try {
			let stat = fs.statSync(fileName);
			if (!stat.isFile()) throw new Error();
		} catch (err) {
			return res.status(404).render('error', {
				error: { status: 404 },
				url: req.originalUrl,
				message: 'Page Not Found'
			});
		}
	}

	let cacheKey = 'parents-night-out-page/' + req.params.file;
	let noCache = globalHelper.isDev || req.query.preview !== undefined ? true : false;
	let cacheTTL = noCache ? 0 : 360;
	cache.get(cacheKey, (err, data) => {
		if (data && !noCache) {
			model.content = data.content;
			Object.assign(model, data.data);
		} else {
			let file = fs.readFileSync(fileName, 'utf8');
			let dataObj = matter(file);
			delete dataObj.orig;
			dataObj.content = marked(dataObj.content);
			model.content = dataObj.content;
			Object.assign(model, dataObj.data);
			if (!noCache) cache.set(cacheKey, dataObj, cacheTTL);
		}

		render(view, model, res);
	});
};
