/* globals */

import { isLoggedIn } from 'common/middlewares/server';
import { loginController, loginSuccessCheck } from '../controllers/login';
import { accountController } from '../controllers/account';

const express = require('express');
const app = express.Router();
const passwordless = require('passwordless');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection, (req, res, next) => {
	res.locals.shared.csrfToken = req.csrfToken();
	next();
});

app.get('/', require('../controllers/index'));
// app.get(['^/:zip([A-Z][0-9][A-Z])s*', '^/:zip([A-Z][0-9][A-Z])s*/*'], require('../controllers/zip').index);
// app.get(['^/:zip([0-9]{5})', '^/:zip([0-9]{5})/*'], require('../controllers/zip').index);
app.use('/admin', require('./admin'));
app.use('/providers', require('./providers'));
app.use('/events', require('./events'));
app.use('/users', require('./users'));
app.use('/user', require('./user'));
app.use('/auth', require('./auth'));
// app.use('/zip', require('./zip'));
app.post('/uploads', require('../controllers/uploads').uploadImage);
app.post('/uploads/delete', require('../controllers/uploads').deleteImage);

/* restricted site */
app.get(
	'/restricted',
	passwordless.restricted({
		failureRedirect: '/login',
		originField: 'origin'
	}),
	(req, res) => {
		res.render('restricted', { user: req.user });
	}
);

// console.log('loginController', loginController);
/* login account screen */
// app.get('/login', csrfProtection, loginController);
app.get(['/login/success', '/account*'], csrfProtection, isLoggedIn, accountController);
app.get('/login/success/check', loginSuccessCheck);
app.get('/login*', csrfProtection, loginController);

/* logout */
app.get(
	'/logout',
	(req, res, next) => {
		if (req.user) {
			res.locals.wasLogged = true;
			delete req.session.userEmail;
			delete req.session.userName;
			delete req.session.userData;
			delete req.session.userToken;
			delete req.session.userLoggedIn;
			delete req.session.userIsAdmin;
		}
		next();
	},
	passwordless.logout(),
	(req, res) => {
		if (res.locals.wasLogged) {
			req.flash('successLogout', 'successLogout');
		}
		if (req.session && req.session.destroy) {
			req.session.destroy(() => {
				res.redirect('/login');
			});
		} else {
			res.redirect('/login');
		}
	}
);

app.post(
	'/login',
	csrfProtection,
	passwordless.requestToken(
		(email, delivery, cb, res) => {
			cb(null, email);
		},
		{ originField: 'origin', userField: 'email' }
	),
	(req, res) => {
		res.json({ success: true });
	}
);

// var sharedAddLimiter = new RateLimit({
// 	windowMs: 600000, // 10 min window
// 	delayAfter: 3, // begin slowing down responses after 3 request
// 	delayMs: 3 * 1000, // slow down subsequent responses by 3 seconds per request
// 	max: 5, // start blocking after 5 requests
// 	message: 'Too many requests, try again in 10 min.'
// });

// app.post('/addshared', csrfProtection, sharedAddLimiter, shared.manage.add);

app.get('/:file(*)', require('../controllers/page'));

module.exports = app;
