/* globals, global */
import path from 'path';
import { Err, ServerGlobal } from './types/my.d';
import { UsersService } from 'services';
import GraphQLClient from 'services/libs/graphql-request-client';
import { superAdminAccessToken } from 'common/config/authToken';
import knex from 'datalayer/config/db';
import { Model } from 'objection';
import { render } from './lib/render';

console.time('Server startup time');

Model.knex(knex);

const clientSrc = path.resolve(__dirname, '../client/src');
const clientSrcProduction = path.resolve(__dirname, '../client/src');

declare const global: ServerGlobal;

global.graphQL = {
	users: new UsersService(superAdminAccessToken)
};

global.clientSrc = isDev() ? clientSrc : clientSrcProduction;
global.rootPath = require('path').resolve(__dirname, '../');
global.appRoot = require('path').resolve(__dirname);
global.render = render;
global._ = require('lodash');
global.globalHelper = {
	isDev: isDev(),
	lastCommit: getLastCommit(),
	host: isDev() ? 'http://localhost:8080' : 'https://feedbe.co'
};
global.hasSSR = process.env.SSR ? true : global.globalHelper.isDev ? false : true;

global.service = new GraphQLClient('http://localhost:8888/graphql', {
	headers: {
		clientType: 'server'
	}
});

require('./lib/jsx-require');

const express = require('express');
const helmet = require('helmet');
const adaro = require('adaro');
const boom = require('express-boom');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const RedisStore = require('connect-redis')(expressSession);
const RedisStorePasswordless = require('./lib/passwordless-redisstore');
const bodyParser = require('body-parser');
const passwordless = require('passwordless');
const email = require('emailjs');
const BUILD = process.env.NODE_ENV === 'production';
const datashared = require('./lib/shared-data');
const routes = require('./routes/index');
const flash = require('./lib/req-flash');
const { loadDb, loadUsersDb } = require('./lib/db');
const app = express();

app.use(helmet());
app.use(
	helmet.hidePoweredBy({
		setTo: 'PHP 4.2.0'
	})
);

app.use(
	helmet.frameguard({
		action: 'deny'
	})
);

const yourEmail = 'sergey@webcorrector.co';
const yourPwd = '!Makaveli2Pac';
const yourSmtp = 'smtp.gmail.com';
const smtpServer = email.server.connect({
	user: yourEmail,
	password: yourPwd,
	host: yourSmtp,
	ssl: true
});

const ViewOptions = {
	cache: BUILD ? true : false,
	whitespace: BUILD ? false : true,
	helpers: [
		require('./lib/dusthelpers'),
		// function(dust) {
		// 	// require('dust-intl').registerWith(dust);
		// 	// dust.helpers.myHelper = function(a, b, c, d) {
		// 	// 	/* still empty */
		// 	// };
		// },
		'dustjs-helpers'
	]
};

app.use(express.static(path.join(__dirname, './public')));
app.use(logger('dev'));

app.use(
	(_req, res, next): void => {
		res.locals.staticAssetsCache = '?' + global.globalHelper.lastCommit;
		res.locals.isDev = global.globalHelper.isDev;
		res.locals.isProd = !global.globalHelper.isDev;
		res.locals.hasSSR = global.hasSSR;
		// force SSR with next line
		// res.locals.isSSR = true;
		next();
	}
);

app.use(boom());
app.use(datashared);

// TODO: Path to be send via email
// var host = isDev() ? 'http://localhost:3000/' : 'https://parents-night-out.club';

// Setup of Passwordless
passwordless.init(new RedisStorePasswordless());
passwordless.addDelivery(function(tokenToSend, uidToSend, recipient, callback) {
	// Send out token
	smtpServer.send(
		{
			text:
				'Hello, \n\nYou can now access Feedbe account via this link\n\n' +
				global.globalHelper.host +
				'?token=' +
				tokenToSend +
				'&uid=' +
				encodeURIComponent(uidToSend),
			from: 'FeedBe Bot <noreply@feedbe.co>',
			to: recipient,
			subject: 'Login Link for ' + global.globalHelper.host
		},
		(err: string) => {
			if (err) {
				console.log(err);
			}
			callback(err);
		}
	);
});

// view engine setup

if (BUILD) {
	app.engine('js', adaro.js(ViewOptions));
	app.set('view engine', 'js');
	app.set('views', path.resolve(__dirname, './views'));
} else {
	app.engine('dust', adaro.dust(ViewOptions));
	app.set('view engine', 'dust');
	app.set('views', path.resolve(__dirname, './views'));
}

// Standard express setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.enable('trust proxy', 1); // trust first proxy
app.use(
	expressSession({
		secret: '99SGGEESSX!X!@@@3!',
		saveUninitialized: false,
		resave: false,
		proxy: true,
		cookie: {
			secure: false,
			httpOnly: true
		},
		store: new RedisStore({ ttl: 432000 })
	})
);

app.use(
	flash({
		locals: 'flash'
	})
);

// Passwordless middleware

app.use(passwordless.sessionSupport());
app.use(
	passwordless.acceptToken({
		enableOriginRedirect: true,
		successFlash: 'LoginSuccess',
		failureFlash: 'LoginFailed'
	})
);

app.use(require('./controllers/user-auth').userAuthMiddleware);

app.use('/', routes);

app.use((_req: any, _res: any, next) => {
	const err: Err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// development error handler
app.use((err, _req, res, next) => {
	if (res.headersSent) {
		return next(err);
	}
	if (err.status !== 404) {
		console.error(err);
	}
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: err
	});
});

const args = process.argv.slice(2);
const prodPort = args[0] && args[0].indexOf('port') > 0 ? args[0].split('=')[1] : 8040;
app.set('port', isDev() ? process.env.PORT || 3000 : prodPort);

loadUsersDb
	.then((db: any) => {
		global.DBUsers = db;
		return loadDb;
	})
	.then((db: any) => {
		global.DB = db;
		const server = app.listen(app.get('port'), () => {
			console.timeEnd('Server startup time');
			console.log('Express server listening on port ' + server.address().port);
		});
	});

// loadDb(db => {
//   global.DB = db;
//   var server = app.listen(app.get('port'), () => {
//     console.log('Express server listening on port ' + server.address().port);
//   });
// });

function isDev() {
	return process.env.NODE_ENV !== 'production' &&
		process.env.NODE_ENV !== 'testing' &&
		process.env.NODE_ENV !== 'staging'
		? true
		: false;
}

function getLastCommit() {
	try {
		return require('fs')
			.readFileSync('./config/lastcommitshort', 'utf8')
			.trim();
	} catch (e) {
		return Date.now();
	}
}

// function parseISOString(s) {
// 	var b = s.split(/\D+/);
// 	return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
// }
