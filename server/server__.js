/* globals, global */
const path = require('path');
// import { Err, ServerGlobal } from './types/my.d';

console.time('Startup time');

// declare const global: ServerGlobal;

const clientSrc = path.resolve(__dirname, '../client/src');
const clientSrcProduction = path.resolve(__dirname, '../client/src');

global.clientSrc = isDev() ? clientSrc : clientSrcProduction;
global.appRoot = require('path').resolve(__dirname);
global.render = require('./lib/render');
global._ = require('lodash');
global.globalHelper = {
	isDev: isDev(),
	lastCommit: getLastCommit(),
	host: isDev() ? 'http://localhost:8080' : 'https://subjer.com'
};

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

app.use((_req, res, next) => {
	res.locals.staticAssetsCache = '?' + global.globalHelper.lastCommit;
	res.locals.isDev = global.globalHelper.isDev;
	res.locals.isProd = !global.globalHelper.isDev;
	res.locals.hasSSR = process.env.SSR ? true : global.globalHelper.isDev ? false : true;
	// force SSR with next line
	// res.locals.isSSR = true;
	next();
});

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
				'Hello, \n\nYou can now access subjer account via this link\n\n' +
				global.globalHelper.host +
				'?token=' +
				tokenToSend +
				'&uid=' +
				encodeURIComponent(uidToSend),
			from: 'Subjer Bot <noreply@subjer.com>',
			to: recipient,
			subject: 'Login Link for ' + global.globalHelper.host
		},
		err => {
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
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
	expressSession({
		secret: '99SGGEESSX!X!@@@3!',
		saveUninitialized: false,
		resave: false,
		proxy: true,
		cookie: {
			secure: false
		},
		store: new RedisStore({ ttl: 432000 })
	})
);

app.use(
	flash({
		locals: 'flash'
	})
);

app.enable('trust proxy', 1); // trust first proxy

app.use(express.static(path.join(__dirname, './public')));

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

app.use((_req, _res, next) => {
	const err = new Error('Not Found');
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
	.then(db => {
		global.DBUsers = db;
		return loadDb;
	})
	.then(db => {
		global.DB = db;
		const server = app.listen(app.get('port'), () => {
			console.timeEnd('Startup time');
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
