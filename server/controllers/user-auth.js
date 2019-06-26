/* globals DBUsers */

const moment = require('moment');
const passport = require('passport');
const TwitterTokenStrategy = require('passport-twitter-token');
const FacebookTokenStrategy = require('passport-facebook-token');
const GoogleTokenStrategy = require('passport-google-token').Strategy;

const config = require('../config/auth');
const admins = require('../config/default').admins;

exports.passport = () => {
	passport.use(
		new TwitterTokenStrategy(
			{
				consumerKey: config.twitterAuth.consumerKey,
				consumerSecret: config.twitterAuth.consumerSecret,
				callbackURL: config.twitterAuth.callbackURL,
				includeEmail: true
			},
			function(token, tokenSecret, profile, done) {
				const user = { name: profile.displayName, email: profile.emails[0].value };
				done(null, user);
			}
		)
	);

	passport.use(
		new FacebookTokenStrategy(
			{
				clientID: config.facebookAuth.clientID,
				clientSecret: config.facebookAuth.clientSecret
			},
			function(accessToken, refreshToken, profile, done) {
				const user = { name: profile.displayName, email: profile.emails[0].value };
				done(null, user);
			}
		)
	);

	passport.use(
		new GoogleTokenStrategy(
			{
				clientID: config.googleAuth.clientID,
				clientSecret: config.googleAuth.clientSecret
			},
			function(accessToken, refreshToken, profile, done) {
				const user = { name: profile.displayName, email: profile.emails[0].value };
				done(null, user);
			}
		)
	);
};

exports.userAuthMiddleware = (req, res, next) => {
	let successLogin = req.flash('passwordless-success');
	let failureLogin = req.flash('passwordless');
	let userLoggedIn = req.flash('userLoggedIn');
	let successLogout = req.flash('successLogout');
	let success = req.flash('success');

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
		delete req.session.userEmail;
		delete req.session.userName;
		delete req.session.userData;
		delete req.session.userLoggedI;
		delete req.session.userIsAdmin;
	}

	if (req.user && !req.session.userEmail) {
		let email = req.user;
		let user = DBUsers.users.findOne({ email });
		let name =
			(req.session.userLoggedIn && req.session.userLoggedIn.name) ||
			req.user.substring(0, req.user.lastIndexOf('@'));
		let now = moment().format();
		req.session.userEmail = email;
		if (user) {
			const { name, created, isProvider, favorites, active, lastLogin, $loki: id } = user;
			req.session.userName = name;
			req.session.userIsAdmin = admins.includes(req.user) ? true : false;
			req.session.userData = {
				id,
				active,
				created,
				isProvider,
				favorites,
				lastLogin
			};
			user.lastLogin = now;
			DBUsers.users.update(user);
		} else {
			// lets create new user
			DBUsers.users.insert({ email, name, active: true, created: now, favorites: null });
			req.session.userName = name;
			req.session.userData = {
				created: now,
				isProvider: null,
				favorites: null,
				lastLogin: now
			};
		}
	}

	if (req.user && req.session.userEmail) {
		res.locals.userEmail = req.session.userEmail;
		res.locals.userName = req.session.userName;
		res.locals.userData = req.session.userData;
		res.locals.userIsAdmin = req.session.userIsAdmin;
		res.locals.shared.userName = req.session.userName;
		res.locals.shared.userData = req.session.userData;
		res.locals.shared.userEmail = req.session.userEmail;
		res.locals.shared.userIsAdmin = req.session.userIsAdmin;
	}

	if (req.query.token) {
		res.redirect(req.path);
		return;
	} else next();
};
