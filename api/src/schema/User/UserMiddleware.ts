import { isLoggedIn, isAdmin } from 'common/middlewares';

const permissions = {
	Query: {
		me: isLoggedIn,
		getUsers: isLoggedIn,
		getUser: isLoggedIn
	}
};

const role = {
	Query: {
		me: isAdmin,
		getUsers: isAdmin,
		getUser: isAdmin,
		findUserByEmail: isAdmin
	},
	User: isAdmin
};

export default [permissions, role];
