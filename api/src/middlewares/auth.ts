import jwt from 'jsonwebtoken';
import { ForbiddenError } from 'apollo-server-express';

import { JWT_SECRET_KEY, JWT_EXPIRED } from '../config/server-config';
import * as error from '../error-messages';

export const isLoggedIn = async (resolve, parent, args, context, info) => {
	context.user = verifyAuth(context.auth);
	if (!context.user.isLogged) {
		throw new ForbiddenError(error.auth.failed);
	}

	return await resolve(parent, args, context, info);
};

export const isAdmin = async (resolve, parent, args, context, info) => {
	context.isAdmin = false;
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
