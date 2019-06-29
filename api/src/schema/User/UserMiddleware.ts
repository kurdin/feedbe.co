import { isLoggedIn, isAdmin } from '../../middlewares';

const permissions = {
	Query: {
		me: isLoggedIn,
		getUsers: isLoggedIn,
		getUser: isLoggedIn
	},
	User: isLoggedIn
};

const role = {
	Query: {
		me: isAdmin,
		getUsers: isAdmin,
		getUser: isAdmin
	},
	User: isAdmin
};

export default [permissions, role];
