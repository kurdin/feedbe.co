/* globals DBUsers, DB */

const moment = require('moment');
const { checkOwnerOrAdmin, removeNullKeys } = require('./utils');

// view user
const view = (req, res) => {
	let user = DBUsers.users.get(req.params.id);
	if (user) res.json(user);
	else res.boom.notFound();
};

// add user
const add = (req, res) => {
	if (!checkOwnerOrAdmin(req, res) || !req.body.form) return res.boom.notFound();
	let form = req.body.form;
	if (res.locals.userIsAdmin) {
		delete form.meta;
		delete form.$loki;
		delete form.createdAgo;
		delete form.created;

		const now = moment().format();
		try {
			const user = DBUsers.users.insert(
				removeNullKeys({
					updated: now,
					created: now,
					...form
				})
			);
			DBUsers.usersDb.saveDatabase(err => {
				if (err) {
					console.log('err', err);
					res.status(500).json({ err });
				} else {
					console.log('saved to new user with id: ', user.$loki);
					res.json(user);
				}
			});
		} catch (err) {
			if (err && err.message.indexOf('Duplicate') !== -1)
				err.message = `User with email ${form.email} already exists`;
			res.status(500).json({ err: err.message });
		}
	} else res.boom.unauthorized();
};

// update user
const update = (req, res) => {
	if (!checkOwnerOrAdmin(req, res) || !req.body.form) return res.boom.notFound();
	let form = req.body.form;
	if (res.locals.userIsAdmin) {
		form.updated = moment().format();

		delete form.meta;
		delete form.$loki;
		delete form.createdAgo;

		const user = DBUsers.users.get(req.params.id);
		const updatedUser = removeNullKeys({ ...user, ...form });
		try {
			DBUsers.users.update({ ...updatedUser });
			DBUsers.usersDb.saveDatabase(err => {
				if (err) {
					res.status(500).json({ err });
				} else {
					console.log('updated user id: ', req.params.id);
					res.json(DBUsers.users.get(req.params.id));
				}
			});
		} catch (err) {
			if (err && err.message.indexOf('Duplicate') !== -1)
				err.message = `User with email ${form.email} already exists`;
			res.status(500).json({ err: err.message });
		}
	} else res.boom.unauthorized();
};

// activate user
const activate = (req, res) => {
	if (!checkOwnerOrAdmin(req, res) || req.body.active === undefined) return res.boom.notFound();
	let form = {
		active: req.body.active
	};

	if (res.locals.userIsAdmin) {
		form.updated = moment().format();
		const user = DBUsers.users.get(req.params.id);
		const updatedUser = removeNullKeys({ ...user, ...form });

		DBUsers.users.update({ ...updatedUser });
		DBUsers.usersDb.saveDatabase(err => {
			if (err) {
				res.status(500).json({ err });
			} else {
				console.log('updated user id: ', req.params.id);
				res.json(DBUsers.users.get(req.params.id));
			}
		});
	} else res.boom.unauthorized();
};

// remove user
const remove = (req, res) => {
	if (!checkOwnerOrAdmin(req, res)) return res.boom.notFound();
	if (res.locals.userIsAdmin) {
		const user = DBUsers.users.get(req.params.id);
		DBUsers.users.remove(user);

		DBUsers.usersDb.saveDatabase(err => {
			if (err) {
				console.log(err);
				res.status(500).json({ err });
			} else {
				console.log('removed user id: ', req.params.id);
				res.json({ removedId: req.params.id });
			}
		});
	} else res.boom.unauthorized('invalid user for remove');
};

module.exports = {
	add,
	view,
	remove,
	activate,
	update
};
