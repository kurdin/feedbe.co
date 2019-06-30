export * from './UsersService';

export interface UsersServiceInterface {
	accessToken: string;
	findOne(userProps: object): Promise<any>;
}

export interface GraphQLServiceInterface {
	users: UsersServiceInterface;
}
