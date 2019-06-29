const urls = require('url');
const express = require('express');
const proxy = require('./express-http-proxy');
const app = express();
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const argv = require('optimist').argv;

// let overlayHost = isDev() ? 'localhost' : 'www.eoverlay.com';
// let overlayPort = isDev() ? '3000' : null;
let host = null;

function getHost(req, res) {
	let site = null;
	if (req.url.indexOf('/--/') === 0) {
		const url = req.url.split('/--/')[1];
		const proxyPath = urls.parse(setHttp(url)).pathname;
		const protocol = urls.parse(setHttp(url)).protocol || 'http:';
		const hostUrl = urls.parse(setHttp(url)).host;
		req.session.reqHost = protocol ? protocol + '//' + hostUrl : hostUrl;
		host = protocol ? protocol + '//' + hostUrl : hostUrl;
		req.session.reqPath = urls.parse(setHttp(proxyPath)).pathname;
		return req.session.reqHost;
	} else if (req.session.reqHost || host) {
		return req.session.reqHost || host;
	} else return site;
}

app.use(
	session({
		store: new RedisStore({ port: 6379, host: 'localhost', prefix: 'eoProxySess:' }),
		cookie: { secure: false, httpOnly: true, path: '/' },
		saveUninitialized: false,
		resave: false,
		proxy: true,
		name: 'eoverlay.proxy.sid',
		ttl: 1800,
		secret: 'this is cat of redis cache'
	})
);

app.use('/test', (req, res) => {
	req.session.test = Math.random()
		.toString(36)
		.substring(7);
	res.json(req.session);
});

app.get('/client-script.js', (req, res) => {
	res.sendFile('/client-script.js', { root: './' });
});

app.use(
	(req, res, next) => {
		// if (!req.query.url && req.url === '/') return res.status(404).send('Wrong request!');
		// if (!req.query.url) return next();
		// if (req.query.url && !req.query.oid) return res.status(404).send('Overlay Not Found');
		// let path = urls.parse(setHttp(req.url)).pathname;
		// let proxyPath = urls.parse(setHttp(req.query.url)).pathname;
		// if (path !== proxyPath) {
		// 	return res.redirect(proxyPath + req.query.url);
		// }
		next();
	},
	proxy(getHost, {
		memoizeHost: false,
		proxyReqPathResolver: function(req) {
			// let url = req.query.url ? setHttp(req.query.url) : req.originalUrl;
			// console.log('req.originalUrl', req.originalUrl);
			// console.log('urls.parse(url).pathname', urls.parse(url).pathname);
			// console.log('req.originalUrl', req.query.url ? req.query.url : req.originalUrl);
			const url = req.url.split('/--/')[1];
			return url ? urls.parse(setHttp(url)).pathname : req.originalUrl;
		},
		userResDecorator: function(rsp, data, req, res) {
			let script = '/client-script.js?v=' + Math.floor(Date.now() / 1000);
			if (!hasAcceptHeaders(req)) return data;
			// if (req.query.oid) {
			// 	script = req.query.oid.substr(0, 2) + '/' + req.query.oid + '/script.js?v=' + Math.floor(Date.now() / 1000);
			// }
			let body = data.toString('utf8');
			let debug = null;
			let debugJS = '';
			if (req.query.debug === 'true') debug = true;
			if (req.query.debug === 'false') debug = false;
			if (debug || debug === false) debugJS = `var EO__DEBUG = ${debug};`;
			body = body.replace(/onsubmit=["|'](.*?)["|']|onchange=["|'](.*?)["|']/gim, function(m) {
				if (m.indexOf('"') === 9) return m + ' onclick="return false" ';
				else return m + " onclick='return false' ";
			});
			body = body.replace(/<button |<select /gim, function(m) {
				return m + ' onclick="return false" ';
			});
			body = body.replace(/href=["|'](.*?)["|']|type=["|']button["|']|type=["|']submit["|']/gim, function(m) {
				if (m.indexOf('"') === 5) return m + ' onclick="return false" ';
				else return m + " onclick='return false' ";
			});
			body = body.replace(/<head[^>]*>/, function(w) {
				return (
					w +
					`
					<script>window.addEventListener("beforeunload", function(event) { event.returnValue = "Do you want to leave?";});
					window.onbeforeunload = function(event) { event.returnValue = "Do you want to leave?" };
					${debugJS}
					</script>
					<script defer type="text/javascript" src="${script}"></script>`
					// <!--<script defer type="text/javascript" src="//${overlayHost}${
					// 	overlayPort ? ':' + overlayPort : ''
					// }/preview/${script}"></script>-->`
				);
			});
			return body;
		}
		// ,
		// filter: function(req, res) {
		// 	return req.method === 'GET';
		// }
	})
);

app.get('/*', (req, res) => {
	res.status(404).send('Overlay Not Found');
});

app.use((err, req, res, next) => {
	if (res.headersSent) {
		return next(err);
	}

	console.error('500 Error on request: ' + req.method + ' host: ' + req.hostname + ' url: ' + req.url);
	console.error(err);

	if (err.code === 'EISDIR') {
		return res.status(500).send({
			err: err.message,
			message:
				'This is development ENV error only. Cause by Kraken `construx-copier` module. Your request is folder in public dir. Just ignore it. This will be 404 in production.'
		});
	}

	if (req.method !== 'POST' && req.originalUrl.indexOf('/ajax') !== 0) {
		res.status(500).render('errors/500', {
			layout: 'default',
			stack: err.stack,
			url: req.url
		});
	} else {
		if (err.message && err.message.indexOf('CSRF') !== -1)
			res.status(409).send('Your session has expired. Reload the page and try again');
		else
			res.status(500).send({
				err: err.message
			});
	}
});

app.listen(argv.port || 4444, () => {
	console.log(`eOverlay Proxy Server Listening on Port ${argv.port || 4444}`);
	console.log(`ENV: ${process.env.NODE_ENV || 'development'}`);
});

// var httpsServer = require('https').createServer(credentials, app);
// httpsServer.listen(4443);
// app.use('/:uid/*', (req, res, next) => {
// 	console.log('req.params', req.params);
// 	apiProxy.web(req, res, { target: 'http://tryes6.com', changeOrigin: false });
// });

function setHttp(link) {
	if (link.search(/^http[s]?:\/\//) === -1) {
		link = 'http://' + link;
	}
	return link;
}

function hasAcceptHeaders(req) {
	var acceptHeader = req.headers['accept'];
	if (!acceptHeader) {
		return false;
	}
	return acceptHeader.indexOf('html') > -1;
}

function isDev() {
	return process.env.NODE_ENV !== 'production' &&
		process.env.NODE_ENV !== 'testing' &&
		process.env.NODE_ENV !== 'staging'
		? true
		: false;
}
