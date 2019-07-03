/* globals, DBUsers */

import { User } from 'datalayer/models/User';

const moment = require('moment');
const admins = require('common/config/application').admins;

export const userSessionMiddleware = async (req, res, next) => {
	const successLogin = req.flash('passwordless-success');
	const failureLogin = req.flash('passwordless');
	const userLoggedIn = req.flash('userLoggedIn');
	const successLogout = req.flash('successLogout');
	const success = req.flash('success');

	if (req.session && successLogin && userLoggedIn && userLoggedIn.email) {
		req.session.userLoggedIn = userLoggedIn;
	}

	if (!req.user && req.session && req.session.userLoggedIn && req.session.userLoggedIn.email) {
		req.user = req.session.userLoggedIn.email;
	}

	if (successLogin && req.user) {
		res.locals.successLogin = true;
	} else if (failureLogin && failureLogin === 'LoginFailed') {
		res.locals.failureLogin = true;
	} else if (successLogout && !req.user) {
		res.locals.successLogout = true;
	} else if (success) {
		res.locals.success = success;
	}

	if (req.user && req.user !== req.session.userEmail) {
		delete req.session.userId;
		delete req.session.userEmail;
		delete req.session.userName;
		delete req.session.userData;
		delete req.session.userToken;
		delete req.session.userLoggedI;
		delete req.session.userIsAdmin;
	}

	if (req.user && !req.session.userEmail) {
		const email = req.user;

		const name =
			(req.session.userLoggedIn && req.session.userLoggedIn.name) || req.user.substring(0, req.user.lastIndexOf('@'));
		const now = moment().format();
		req.session.userEmail = email;

		const user = await User.query().findOne({ email });

		if (user && user.id) {
			const { username, createdAt, settings, isActive, lastLogin, id } = user;
			req.session.userName = username || name;
			req.session.userIsAdmin = admins.includes(req.user) ? true : false;
			req.session.userToken = user.token;
			req.session.userId = id;
			req.session.userData = {
				id,
				active: isActive ? true : false,
				createdAt,
				settings,
				lastLogin
			};
			await user.$query().patch({
				lastLogin: now
			});
		} else {
			// lets create new user and login

			const newUser = await User.query().insert({ email, lastLogin: now, username: name, createdAt: now });
			const { id, createdAt, token } = newUser;
			req.session.userName = name;
			req.session.userToken = token;
			req.session.userId = id;
			req.session.userIsAdmin = admins.includes(req.user) ? true : false;
			req.session.userData = {
				id,
				createdAt,
				active: true,
				lastLogin: now
			};
		}
	}

	if (req.user && req.session.userEmail) {
		const { userEmail, userId, userName, userData, userIsAdmin, userToken } = req.session;
		res.locals.userEmail = res.locals.shared.userEmail = userEmail;
		res.locals.userId = res.locals.shared.userName = userId;
		res.locals.userName = res.locals.shared.userName = userName;
		res.locals.userData = res.locals.shared.userData = userData;
		res.locals.userIsAdmin = res.locals.shared.userIsAdmin = userIsAdmin;
		res.locals.userToken = res.locals.shared.userToken = userToken;
	}

	if (req.query.token) {
		res.redirect(req.path);
		return;
	} else {
		next();
	}
};
