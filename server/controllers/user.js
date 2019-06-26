/* globals DBUsers */

const userChangeName = (req, res) => {
	if (req.user && req.user === req.body.email) {
		DBUsers.users.findAndUpdate({ email: req.body.email }, user => (user.name = req.body.name));
		req.session.userName = req.body.name;
		req.flash('success', 'Your Name is Updated');
		return res.json({ success: true });
	}

	res.boom.notFound();
};

const userChangeType = (req, res) => {
	if (req.user && req.user === req.body.email) {
		let isProvider = req.body.isProvider;
		DBUsers.users.findAndUpdate({ email: req.body.email }, user => (user.isProvider = isProvider));
		if (req.session.userData) {
			req.session.userData.isProvider = isProvider;
			req.flash('success', 'Your Account Type is Updated');
		}

		return res.json({ success: true });
	}

	res.boom.notFound();
};

module.exports = {
	userChangeName,
	userChangeType
};
