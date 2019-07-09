import { clientSrc, render } from '../types';

const LoginComponent = require(clientSrc + '/apps/login/server');

export const loginSuccessCheck = (req, res) => {
	return res.json({ isAuthenticated: req.isAuthenticated(), redirect: '/account' });
};

export const loginController = (req, res) => {
	if (req.isAuthenticated()) {
		return res.redirect('/account');
	}

	const LoginComponentHTML = LoginComponent({ origin: req.query.origin }, req.originalUrl, res);

	if (LoginComponentHTML && LoginComponentHTML.redirect) {
		return;
	}

	res.locals.LoginComponentHTML = LoginComponentHTML;

	const model = {
		shared: {
			origin: req.query.origin
		}
	};

	render('login', model, res);
};
