/* globals DBUsers, globalHelper, render */

// import AdminComponent from '@client/apps/admin/Admin.server';
import { sortBy } from 'lodash';
// import { _extend } from 'util';
import util from 'util';

declare const DB: any;
declare const appRoot: string;

const fs = require('fs');
const path = require('path');

const imagesMediaUploadURLPath = '/media/uploads/www';
const imagesMediaUploadPublic = appRoot + '/public';
const imagesMediaUploadFullPath = imagesMediaUploadPublic + '/' + imagesMediaUploadURLPath;
const shortid = require('shortid');
// const flatAsync = require('flatasync');
const Cacheman = require('cacheman');
const recursive = require('../lib/recursive-readdir');
const cache = new Cacheman({ prefix: 'PNO', ttl: 600, engine: 'redis' });

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

const cacheKeys = {
	providers: 'dbs.providers/all',
	events: 'dbs.events/all',
	users: 'dbusers.users/all'
};

exports.index = async (req, res) => {
	const view = 'admin';

	let minCache = globalHelper.isDev || req.query.nocache !== undefined ? true : false;
	let cacheTTL = minCache ? '10s' : '1m';
	let model = {
		shared: {}
	};

	let providersData = await cache.get(cacheKeys.providers);
	let eventsData = await cache.get(cacheKeys.events);
	let usersData = await cache.get(cacheKeys.users);

	// const [err] = await flatAsync(cache.set(cacheKey, cacheProvidersData));
	// if (err) console.error(err);

	model.shared.providers = providersData ? providersData : DB.providers.find();
	model.shared.events = eventsData ? eventsData : DB.events.find();
	model.shared.users = usersData ? usersData : DBUsers.users.find();

	if (!providersData) {
		await cache.set(cacheKeys.providers, model.shared.providers, cacheTTL);
	}

	if (!eventsData) {
		await cache.set(cacheKeys.events, model.shared.events, cacheTTL);
	}

	if (!usersData) {
		await cache.set(cacheKeys.users, model.shared.users, cacheTTL);
	}

	model.shared.AdminAppInitProps = {
		baseUrl: '/admin',
		test: 'Hello Admin',
		store: {
			providers: model.shared.providers,
			events: model.shared.events,
			users: model.shared.users
		}
	};

	// res.locals.AdminComponentHTML = AdminComponent(model.shared.AdminAppInitProps, req.originalUrl, res);
	if (res.locals.AdminComponentHTML && res.locals.AdminComponentHTML.redirect) {
		return;
	}

	render(view, model, res);
};

exports.upload = async (req, res) => {
	const view = 'admin-upload';
	recursiveListDir(imagesMediaUploadFullPath, imagesMediaUploadPublic, files => {
		let model = {
			host: globalHelper.host,
			images: files,
			shared: {
				images: files
			}
		};

		render(view, model, res);
	});
};

function recursiveListDir(rootDir, publicDir, cb) {
	recursive(rootDir, ['.*'], function(err, files) {
		const relFiles = files.map(file => {
			let relFile = path.relative(publicDir, file);
			return {
				file: relFile.replace(/\\/g, '/'),
				date: fs.statSync(file).ctime
			};
		});
		relFiles.sort((a, b) => b.date - a.date);
		cb(relFiles);
	});
}

function listDir(rootDir, publicDir) {
	try {
		fs.statSync(rootDir);
	} catch (err) {
		return {
			res: 'error',
			msg: 'not exist'
		};
	}

	var files = [];
	var names = fs.readdirSync(rootDir);
	names
		.map(name => {
			var stat = getStat(path.join(rootDir, name));

			if (name.indexOf('.') === 0 || !stat.type) return false;

			var current = path.relative(publicDir, rootDir);
			return files.push({
				p: path.join(current, name).replace(/\\/g, '/'),
				n: name,
				t: stat.type,
				s: stat.size,
				d: stat.mtime
			});
		})
		.filter(Boolean);

	return sortBy(files, ['t', 'p']);
}

function getStat(path: string) {
	let stat;

	try {
		stat = fs.statSync(path);
		stat.type = fs.statSync(path).isDirectory() ? 'directory' : fs.statSync(path).isFile() ? 'file' : null;
	} catch (error) {
		if (error.code !== 'ENOENT') {
			throw error;
		}
	}

	return stat;
}
