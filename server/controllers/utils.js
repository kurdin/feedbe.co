const removeNullKeys = obj => {
	let o = {};
	Object.keys(obj).forEach(key => {
		if (obj[key] !== null) o[key] = obj[key];
	});
	return o;
};

const checkOwnerOrAdmin = (req, res) => {
	if (req.user && (req.user === req.body.email || res.locals.userIsAdmin)) return true;

	return false;
};

module.exports = {
	removeNullKeys,
	checkOwnerOrAdmin
};
