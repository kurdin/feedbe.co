export const isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated() && req.session.userId) {
		next();
	} else {
		res.redirect('/login');
	}
};
