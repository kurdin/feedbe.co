import jwt from 'jsonwebtoken';

import { JWT_SECRET_KEY, JWT_EXPIRED } from 'common/config/authToken';
import { superAdminAccessToken } from 'common/config/authToken';
import * as error from 'common/error-messages';

export const isLoggedIn = async (resolve, parent, args, context, info) => {
	context.user = verifyAuth(context.auth);
	if (!context.user.isLogged) {
		throw new Error(error.auth.failed);
	}

	return await resolve(parent, args, context, info);
};

export const isAdmin = async (resolve, parent, args, context, info) => {
	const isAdminTokenValid = context.adminAccessToken === `Bearer: ${superAdminAccessToken}` ? true : false;
	context.isAdmin = isAdminTokenValid;
	return await resolve(parent, args, context, info);
};

export function createToken(userInfo: { id: string; username: string; email: string }) {
	return jwt.sign(userInfo, JWT_SECRET_KEY, { expiresIn: JWT_EXPIRED });
}

function verifyAuth(authorization: string = null) {
	if (!authorization) {
		return {
			isLogged: false
		};
	}

	try {
		const userInfo = verifyToken(authorization);

		if (userInfo && userInfo.id) {
			return {
				...userInfo,
				isLogged: true
			};
		} else {
			return {
				isLogged: false
			};
		}
	} catch (error) {
		return {
			isLogged: false
		};
	}
}

function verifyToken(auth) {
	const token = auth.split(' ')[1];
	const userDecoded = jwt.verify(token, JWT_SECRET_KEY);
	return userDecoded;
}
