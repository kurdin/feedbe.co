/* globals, DBUsers */

import { twitterAuth, facebookAuth, googleAuth } from 'common/config/socialAuth';

const passport = require('passport');
const TwitterTokenStrategy = require('passport-twitter-token');
const FacebookTokenStrategy = require('passport-facebook-token');
const GoogleTokenStrategy = require('passport-google-token').Strategy;

export const passportAuth = () => {
	passport.use(
		new TwitterTokenStrategy(
			{
				consumerKey: twitterAuth.consumerKey,
				consumerSecret: twitterAuth.consumerSecret,
				callbackURL: twitterAuth.callbackURL,
				includeEmail: true
			},
			function(_, __, profile, done) {
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
			function(_, __, profile, done) {
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
			function(_, __, profile, done) {
				const user = { name: profile.displayName, email: profile.emails[0].value };
				done(null, user);
			}
		)
	);
};
