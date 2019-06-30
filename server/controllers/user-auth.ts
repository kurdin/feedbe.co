/* globals, DBUsers, graphQL */

// import loginQuery from 'query/server/login.graphql.js';
import { twitterAuth, facebookAuth, googleAuth } from '../config/socialAuth';
import { GraphQLServiceInterface } from '../services/index';

const moment = require('moment');
const passport = require('passport');
const TwitterTokenStrategy = require('passport-twitter-token');
const FacebookTokenStrategy = require('passport-facebook-token');
const GoogleTokenStrategy = require('passport-google-token').Strategy;

const admins = require('common/config/application').admins;

declare const graphQL: GraphQLServiceInterface;

exports.passport = () => {
	passport.use(
		new TwitterTokenStrategy(
			{
				consumerKey: twitterAuth.consumerKey,
				consumerSecret: twitterAuth.consumerSecret,
				callbackURL: twitterAuth.callbackURL,
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
				clientID: facebookAuth.clientID,
				clientSecret: facebookAuth.clientSecret
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
				clientID: googleAuth.clientID,
				clientSecret: googleAuth.clientSecret
			},
			function(accessToken, refreshToken, profile, done) {
				const user = { name: profile.displayName, email: profile.emails[0].value };
				done(null, user);
			}
		)
	);
};

exports.userAuthMiddleware = async (req, res, next) => {
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
		delete req.session.userEmail;
		delete req.session.userName;
		delete req.session.userData;
		delete req.session.userLoggedI;
		delete req.session.userIsAdmin;
	}

	const user = await graphQL.users.findOne({ email: 'skurdin@yahoo.com' });
	// console.log('user', user);

	if (req.user && !req.session.userEmail) {
		const email = req.user;

		const name =
			(req.session.userLoggedIn && req.session.userLoggedIn.name) || req.user.substring(0, req.user.lastIndexOf('@'));
		const now = moment().format();
		req.session.userEmail = email;
		if (user) {
			const { username, created, isProvider, favorites, active, lastLogin, $loki: id } = user;
			req.session.userName = username || name;
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
	} else {
		next();
	}
};
