const _ = require('lodash');
const moment = require('moment');
const Timeago = require('timeago.js');

module.exports = function(dust) {
	//Create a helper called 'AppSharedData'
	dust.helpers.AppSharedData = function(chunk, context) {
		var data = context.get('shared') || {};
		var appshared = context.get('AppShared');
		var globaldata = context.get('globalShared') || null;

		var appdata = appshared && appshared.data ? _.merge(data, appshared.data) : data;
		if (globaldata) appdata = _.merge(globaldata, appdata);

		return chunk.write((appshared && appshared.inject(appdata)) || '');
	};

	dust.helpers.timeAgo = function(chunk, context, bodies, params) {
		const date = context.resolve(params.date) || Date.now();
		return chunk.write(Timeago.format(date));
	};

	dust.helpers.formatDate = function(chunk, context, bodies, params) {
		// Retrieve culture from request.
		var culture = context.resolve(params.culture) || 'en';
		var date = context.resolve(params.date) || '';
		var time = context.resolve(params.time) || '';
		var timeInputFormat = context.resolve(params.timeinputformat) || 'HH:mm';
		var varible = context.resolve(params.out);

		//Retrieve the format string from the template parameters.
		var format = context.resolve(params.format) || 'lll';

		if (date === 'undefined') return chunk.write('');

		//Parse the date or time object using MomentJS
		var m = date ? moment.utc(new Date(date)).locale(culture) : time ? moment(time, [timeInputFormat]).locale(culture) : null;

		if (!m) return chunk.write('');

		//Format the string
		var output = m.format(format);

		var dateOut = {
			date: output
		};

		if (varible) {
			dateOut[varible] = output;
		}

		//Write the final value out to the template
		return bodies && bodies.block ? chunk.render(bodies.block, context.push(dateOut)) : chunk.write(output);

		// return chunk.write(output);
	};
};
