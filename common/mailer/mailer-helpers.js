exports.createEmailActivationLink = function(email, req) {
	return req
		.adminService('/users/activate')
		.post({
			email: email
		})
		.then(hash => {
			return mailer.send({
				template: 'activationlink',
				lang: req.getLocale(),
				test: false,
				message: {
					to: email,
					subject: 'Account Activation Link',
					data: {
						hash: hash.hash,
						site: req.session.sessionHelper.site,
						domain: req.session.sessionHelper.domain
					}
				}
			});
		})
		.catch(err => {
			if (err.statusCode === '404') {
				throw new Error({
					code: 404,
					message: 'User with email Not Found',
					email: email
				});
			} else {
				throw new Error({
					code: err.statusCode,
					message: 'Unexpected Error'
				});
			}
		});
};
