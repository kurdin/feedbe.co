/* globals DBUsers, DB */

const moment = require('moment');
const { checkOwnerOrAdmin, removeNullKeys } = require('./utils');

const providerView = (req, res) => {
	let provider = DB.providers.get(req.params.id);
	if (provider) res.json(provider);
	else res.boom.notFound();
};

const providerAdd = (req, res) => {
	if (!checkOwnerOrAdmin(req, res) || !req.body.form) return res.boom.notFound();
	const isAdmin = res.locals.userIsAdmin;
	let email = req.body.email;
	let form = req.body.form;
	let userId = req.body.userId;
	let user = DBUsers.users.findOne({ email });
	const { isProvider, active = true, $loki: uid } = user;
	if ((isProvider && uid && active && uid === userId) || isAdmin) {
		delete form.meta;
		delete form.$loki;
		delete form.createdAgo;
		delete form.created;

		const now = moment().format();
		const provider = DB.providers.insert(
			removeNullKeys({
				userId: uid,
				updated: now,
				created: now,
				...form
			})
		);
		DB.mainDb.saveDatabase(err => {
			if (err) {
				console.log(err);
				res.status(500).json({ err });
			} else {
				console.log('saved to new provider with id: ', provider.$loki);
				res.json(provider);
			}
		});
	} else res.boom.notFound();
};

// DB.codes.findAndUpdate({ id: req.params.id }, (code) => {
// 	return Object.assign(code, req.body);
// });

const providerUpdate = (req, res) => {
	if (!checkOwnerOrAdmin(req, res) || !req.body.form) return res.boom.notFound();
	const isAdmin = res.locals.userIsAdmin;
	let email = req.body.email;
	let form = req.body.form;
	let userId = req.body.userId;
	let user = DBUsers.users.findOne({ email });
	const { isProvider, active = true, $loki: uid } = user;

	if ((isProvider && uid && active && uid === userId) || isAdmin) {
		form.updated = moment().format();

		delete form.meta;
		delete form.$loki;
		delete form.createdAgo;

		let provider = DB.providers.get(req.params.id);
		if (provider.userId === userId || isAdmin) {
			const updatedProvider = removeNullKeys({ ...provider, ...form });
			DB.providers.update({ ...updatedProvider });
		} else return res.boom.unauthorized('invalid user for update');

		DB.mainDb.saveDatabase(err => {
			if (err) {
				console.log(err);
				res.status(500).json({ err });
			} else {
				console.log('updated provider id: ', req.params.id);
				res.json(DB.providers.get(req.params.id));
			}
		});
	} else res.boom.notFound();
};

const providerActivate = (req, res) => {
	if (!checkOwnerOrAdmin(req, res) || req.body.active === undefined) return res.boom.notFound();
	const isAdmin = res.locals.userIsAdmin;
	let email = req.body.email;
	let form = {
		active: req.body.active
	};
	let user = DBUsers.users.findOne({ email });
	let userId = req.body.userId;
	const { isProvider, active = true, $loki: uid } = user;
	if ((isProvider && uid && active && uid === userId) || isAdmin) {
		form.updated = moment().format();
		let provider = DB.providers.get(req.params.id);
		if (provider.userId === userId || isAdmin) {
			const updatedProvider = removeNullKeys({ ...provider, ...form });
			DB.providers.update({ ...updatedProvider });
		} else return res.boom.unauthorized('invalid user for activate');

		DB.mainDb.saveDatabase(err => {
			if (err) {
				console.log(err);
				res.status(500).json({ err });
			} else {
				console.log('active status updated provider id: ', req.params.id);
				res.json(DB.providers.get(req.params.id));
			}
		});
	} else res.boom.notFound();
};

const providerRemove = (req, res) => {
	if (req.user && (req.user === req.body.email || res.locals.userIsAdmin)) {
		const isAdmin = res.locals.userIsAdmin;
		let email = req.body.email;
		let userId = req.body.userId;
		let user = DBUsers.users.findOne({ email });
		const { isProvider, active = true, $loki: uid } = user;
		if ((isProvider && uid && active && uid === userId) || isAdmin) {
			let provider = DB.providers.get(req.params.id);
			if (provider.userId === userId || isAdmin) {
				DB.providers.remove(provider);
			} else return res.boom.unauthorized('invalid user for remove');

			DB.mainDb.saveDatabase(err => {
				if (err) {
					console.log(err);
					res.status(500).json({ err });
				} else {
					console.log('removed provider id: ', req.params.id);
					res.json({ removedId: req.params.id });
				}
			});
		} else res.boom.notFound();
	} else res.boom.notFound();
};

module.exports = {
	providerAdd,
	providerRemove,
	providerActivate,
	providerUpdate,
	providerView
};
