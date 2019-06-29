/* globals DB, clientSrc, render */

// const CacheRedis = require('cacheman-redis');
// const cache = new CacheRedis({ port: null, host: null });

const LoginComponent = require(clientSrc + '/apps/login/server');

module.exports = (req, res) => {
	let userProviders;

	if (req.user && req.session.userData && req.session.userData.id) {
		userProviders = DB.providers.find({ userId: req.session.userData.id });
	}

	const LoginComponentHTML = LoginComponent({ origin: req.query.origin }, req.originalUrl, res);

	if (LoginComponentHTML && LoginComponentHTML.redirect) return;

	res.locals.LoginComponentHTML = LoginComponentHTML;

	const model = {
		shared: {
			origin: req.query.origin,
			userProviders
		}
	};

	render('account', model, res);
};
