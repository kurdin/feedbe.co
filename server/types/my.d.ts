/* global */
import Global from '@types/node';

export type GlobalHelper = {
	isDev: boolean;
	lastCommit: string;
	host: string;
};

export type Mailer = {
	send: Function;
};

export interface ServerGlobal extends Global {
	mailer: Mailer;
	appRoot: string;
	rootPath: string;
	clientSrc: string;
	DBUsers: object;
	DB: object;
	hasSSR: boolean;
	service: Class;
	graphQL: object;
	render: Function;
	_: Function;
	globalHelper: GlobalHelper;
}

export interface Err extends Error {
	status?: number;
	errno?: number;
	code?: string;
	path?: string;
	syscall?: string;
	stack?: string;
}
