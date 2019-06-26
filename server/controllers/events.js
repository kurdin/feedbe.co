/* globals DBUsers, DB */

const moment = require('moment');
const { checkOwnerOrAdmin, removeNullKeys } = require('./utils');

const eventView = (req, res) => {
	let event = DB.events.get(req.params.id);
	if (event) res.json(event);
	else res.boom.notFound();
};

const eventAdd = (req, res) => {
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
		const event = DB.events.insert(
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
				console.log('saved to new event with id: ', event.$loki);
				res.json(event);
			}
		});
	} else res.boom.notFound();
};

const eventUpdate = (req, res) => {
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

		let event = DB.events.get(req.params.id);
		if (event.userId === userId || isAdmin) {
			const updatedEvent = removeNullKeys({ ...event, ...form });
			DB.events.update({ ...updatedEvent });
		} else return res.boom.unauthorized('invalid user for update');

		DB.mainDb.saveDatabase(err => {
			if (err) {
				res.status(500).json({ err });
			} else {
				console.log('updated event id: ', req.params.id);
				res.json(DB.events.get(req.params.id));
			}
		});
	} else res.boom.notFound();
};

const eventActivate = (req, res) => {
	if (!checkOwnerOrAdmin(req, res) || req.body.active === undefined) return res.boom.notFound();
	const isAdmin = res.locals.userIsAdmin;
	let email = req.body.email;
	let form = {
		active: req.body.active
	};
	let userId = req.body.userId;
	let user = DBUsers.users.findOne({ email });
	const { isProvider, active = true, $loki: uid } = user;
	if ((isProvider && uid && active && uid === userId) || isAdmin) {
		form.updated = moment().format();
		let event = DB.events.get(req.params.id);
		if (event.userId === userId || isAdmin) {
			const updatedEvent = removeNullKeys({ ...event, ...form });
			DB.events.update({ ...updatedEvent });
		} else return res.boom.unauthorized('invalid user for activation');

		DB.mainDb.saveDatabase(err => {
			if (err) {
				res.status(500).json({ err });
			} else {
				console.log(`${req.body.active === true ? 'Activated' : 'Deactivated'} event id: `, req.params.id);
				res.json(DB.events.get(req.params.id));
			}
		});
	} else res.boom.notFound();
};

const eventRemove = (req, res) => {
	if (!checkOwnerOrAdmin(req, res)) return res.boom.notFound();
	const isAdmin = res.locals.userIsAdmin;
	let email = req.body.email;
	let userId = req.body.userId;
	let user = DBUsers.users.findOne({ email });
	const { isProvider, active = true, $loki: uid } = user;
	if ((isProvider && uid && active && uid === userId) || isAdmin) {
		let event = DB.events.get(req.params.id);
		if (event.userId === userId || isAdmin) {
			DB.events.remove(event);
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
};

module.exports = {
	eventAdd,
	eventView,
	eventRemove,
	eventActivate,
	eventUpdate
};
