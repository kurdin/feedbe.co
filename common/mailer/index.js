const nodemailer = require('nodemailer');
const _ = require('lodash');
const config = require('../config/mailer');
const striptags = require('striptags');
const juice = require('juice');
const path = require('path');
const Templates = require('../libs/templates-cache');
const log = require('../libs/log')('COMMON/MAILER');

/**
 * Mailer
 * Merge config defaults and send single or multiple mails
 *
 * @param (object) express app
 */
export default function Mailer(app) {
	const self = {};
	const settings = app.locals.settings;
	const ext = settings['view engine'];

	self.res = {};
	self.options = {};

	var __construct = function() {
		self.setRes();
	};

	/**
	 * Set Res
	 */
	self.setRes = function() {
		if (_.isUndefined(app.response)) {
			self.res = app;
		} else {
			self.res = app.response.app;
		}
	};

	/**
	 * Set Defaults
	 * Prep the config defaults, send the message
	 *
	 * @param (literal) options
	 * @return (object) smtpTransport
	 */
	self.setDefaults = function(options) {
		self.options = options;

		// defaults
		self.options.smtpConfig = _.defaults(config.smtpConfig, self.options.smtpConfig);

		// always force messages to be an array for convenience
		if (!_.isArray(self.options.message)) {
			self.options.message = [self.options.message];
		}

		// add mail if no parent dir is listed
		if (self.options.template && self.options.template.split('/').length) {
			self.options.template = 'emails/' + (self.options.lang || 'en') + '/' + self.options.template;
			let templateFile = path.join(settings.views, self.options.template + '.' + ext);
			if (!Templates.isExist(templateFile)) {
				let error = `Template File "${self.options.template}" in language ${self.options.lang ||
					'en'} for Mailer not found`;
				log.e(error);
				throw new Error(error);
			}
		}
	};

	/**
	 * Transport
	 * Loops through messages applying the template, then send mail
	 *
	 * @return (object) smtpTransport
	 */
	self.transport = function() {
		let transporter = nodemailer.createTransport(self.options.smtpConfig);
		let sendArray = [];

		// we will always loop even on one message
		_.each(self.options.message, message => {
			sendArray.push(
				new Promise((resolve, reject) => {
					message = _.assign(_.clone(config.message), message);
					if (message.subjectPrefix) message.subject = message.subjectPrefix + message.subject;

					if (message.text) {
						if (!self.options.test) {
							transporter.sendMail(message, function(error, response) {
								if (error) {
									log.e(error);
									reject(error);
								} else {
									log.i('Email Message Sent: ' + response.response);
									resolve({ success: true, response: response.response });
								}
							});
						} else {
							log.i('Fake Message sent to ' + message.to);
							resolve({ success: true });
						}
						return;
					}
					// render the dust template and set the output to the message html
					self.res.render(self.options.template, message.data, function(err, out) {
						if (err) throw new Error(err);

						stream2string(out)
							.then(html => {
								message.html = juice(html);
								message.text = striptags(message.html);
								return message;
							})
							.then(function(message) {
								if (!self.options.test) {
									transporter.sendMail(message, function(error, response) {
										if (error) {
											log.e(error);
											reject(error);
										} else {
											log.i('Email Message Sent: ' + response.response);
											resolve({ success: true, response: response.response });
										}
									});
								} else {
									log.i('Fake Message sent to ' + message.to);
									resolve({ success: true });
								}
							});
					});
				})
			);
		});
		return Promise.all(sendArray);
	};

	self.send = function(options) {
		self.setDefaults(options);
		return self.transport();
	};

	__construct();
	return self;
}

function stream2string(stream, cb) {
	cb = cb || function() {};

	var str = '';

	return new Promise((resolve, reject) => {
		stream.on('data', function(data) {
			str += data.toString();
		});
		stream.on('end', function() {
			resolve(str);
			cb(null, str);
		});
		stream.on('error', function(err) {
			reject(err);
			cb(err);
		});
	});
}

// "host": "mail.eoverlay.com",
// "port": 587,
// "auth": {
// 	"user": "admin@eoverlay.com",
// 	"pass": "eoAdminZ!"
// }

// const yourEmail = 'sergey@webcorrector.co';
// const yourPwd = '!Makaveli2Pac';
// const yourSmtp = 'smtp.gmail.com';
