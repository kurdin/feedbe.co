const nodemailer = require('nodemailer');
const _ = require('lodash');
const config = require('../config/mailer');
const Bluebird = require('bluebird');
const striptags = require('striptags');
const juice = require('juice');
const path = require('path');
const fs = require('fs');
const Templates = require('./templates-cache');
const log = require('./log')('LIB/MAILER');
const dust = require('dustjs-helpers');
const confit = require('confit');
const handlers = require('shortstop-handlers');

require('./shared/dust/filters/email-messages')(dust);

function Mailer(conf) {
	var self = this;
	self.setDefaults = function(options) {
		self.options = options;
		self.options.view = conf.get('express:views');
		self.options.ext = conf.get('express:view engine');

		dust.onLoad = function(templateName, options, callback) {
			let src = fs.readFileSync(path.join(self.options.view, templateName + '.' + self.options.ext), 'utf8');
			if (self.options.ext === 'js') {
				dust.loadSource(src);
				callback();
			} else {
				callback(null, src);
			}
		};

		// defaults
		self.options.smtpConfig = _.defaults(config.smtpConfig, self.options.smtpConfig);

		// always force messages to be an array for convenience
		if (!_.isArray(self.options.message)) {
			self.options.message = [self.options.message];
		}

		if (self.options.template.split('/').length) {
			self.options.template = 'emails/' + (self.options.lang || 'en') + '/' + self.options.template;
			let templateFile = path.join(self.options.view, self.options.template + '.' + self.options.ext);
			if (!Templates.isExist(templateFile)) {
				let error = `Template File "${self.options.template}" in language ${self.options.lang ||
					'en'} for Mailer not found`;
				log.e(error);
				throw new Error(error);
			}
		}
	};

	self.transport = function() {
		let transporter = nodemailer.createTransport(self.options.smtpConfig);
		let sendArray = [];

		_.each(self.options.message, function(message) {
			sendArray.push(
				new Bluebird((resolve, reject) => {
					message = _.assign(_.clone(config.message), message);
					if (message.subjectPrefix) message.subject = message.subjectPrefix + message.subject;
					dust.render(self.options.template, message.data, function(err, html) {
						if (err) throw new Error(err);
						message.html = juice(html);
						message.text = striptags(message.html);
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
							log.i(message);
							resolve({ success: true });
						}
					});
				})
			);
		});
		return new Bluebird.all(sendArray);
	};

	self.send = function(options) {
		self.setDefaults(options);
		return self.transport();
	};
}

let conf;

module.exports = cb => {
	if (typeof conf !== 'undefined') {
		let mailer = new Mailer(conf);
		cb(mailer);
		return;
	}

	let opts = {
		basedir: path.join(__dirname, '../config'),
		protocols: {
			path: handlers.path('./')
		}
	};
	confit(opts).create(function(err, c) {
		let mailer = new Mailer(c);
		conf = c;
		cb(mailer);
	});
};
