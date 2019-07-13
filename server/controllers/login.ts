import { clientSrc, render } from '../types';
import { User } from 'datalayer/models';

const LoginComponent = require(clientSrc + '/apps/login/server');

export const loginSuccessCheck = (req, res) => {
	return res.json({ isAuthenticated: req.isAuthenticated(), redirect: '/account' });
};

export const loginPasswordResetController = async (req, res) => {
	const email = req.body.email;
	const user = await User.query().findOne({ email });

	if (!user) {
		return res.boom.notFound();
	}

	// yield mailer.send({
	// 			template: 'passchange',
	// 			lang: req.getLocale(),
	// 			test: false,
	// 			message: {
	// 				to: user.email,
	// 				subject: 'Notification of Password Change',
	// 				data: {
	// 					site: req.session.sessionHelper.site,
	// 					domain: req.session.sessionHelper.domain,
	// 					name: user.displayName,
	// 					email: user.email
	// 				}
	// 			}
	// 		});
};

export const loginController = (req, res) => {
	if (req.isAuthenticated() && !req.originalUrl.includes('/login/reset-password')) {
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
