declare const clientSrc: string;
declare const render: Function;

const LoginComponent = require(clientSrc + '/apps/login/server');

export const loginController = (req, res) => {
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
