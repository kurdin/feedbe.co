/* globals */

import { superAdminAccessToken } from 'common/config/authToken';
import { UsersServiceInterface } from './';
import { findUserByEmail } from 'queries/users/findOneByEmail.graphql';

declare const service: any;

export class UsersService implements UsersServiceInterface {
	accessToken: string;

	constructor(accessToken) {
		this.accessToken = accessToken;
	}

	async findOne(userProps: { email: string }): Promise<any> {
		const { email } = userProps;
		const user = await service.request(findUserByEmail, { email }, { adminToken: superAdminAccessToken });
		return user;
	}
}
