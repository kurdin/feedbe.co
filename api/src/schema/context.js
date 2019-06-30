export default ({ req }) => {
	return {
		req,
		auth: req.headers.authorization,
		adminAccessToken: req.headers.adminaccesstoken
	};
};
