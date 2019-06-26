'use strict';
/*
 * node-timeago
 * Cam Pedersen
 * <diffference@gmail.com>
 * Oct 6, 2011
 * Timeago is a jQuery plugin that makes it easy to support automatically
 * updating fuzzy timestamps (e.g. "4 minutes ago" or "about 1 day ago").
 *
 * @name timeago
 * @version 0.10.0
 * @requires jQuery v1.2.3+
 * @author Ryan McGeary
 * @license MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 * For usage and examples, visit:
 * http://timeago.yarp.com/
 *
 * Copyright (c) 2008-2011, Ryan McGeary (ryanonjavascript -[at]- mcgeary [*dot*] org)
 */
module.exports = function (timestamp, noAgo, localizedText) {
	noAgo = noAgo || false;
	if (timestamp instanceof Date) {
		return inWords(timestamp, noAgo, localizedText);
	} else if (typeof timestamp === 'string') {
		return inWords(parse(timestamp), noAgo, localizedText);
	} else if (typeof timestamp === 'number') {
		return inWords(new Date(timestamp), noAgo, localizedText);
	}
};

var settings = {
	allowFuture: false,
	strings: {
		prefixAgo: null,
		prefixFromNow: null,
		ago: 'ago',
		suffixFromNow: null,
		a_min: 'a min',
		d_mins: '%d mins',
		one_hour: 'one hour',
		d_hours: '%d hours',
		a_day: 'a day',
		d_days: '%d days',
		a_month: 'a month',
		d_months: '%d months',
		a_year: 'a year',
		d_years: '%d years',
		numbers: []
	}
};

var $text = settings.strings;

module.exports.settings = settings;

var $l = {};

$l.inWords = function (distanceMillis) {
	var prefix = $text.prefixAgo;
	var suffix = $text.ago;
	if (settings.allowFuture) {
		if (distanceMillis < 0) {
			prefix = $text.prefixFromNow;
			suffix = $text.suffixFromNow;
		}
	}

	var seconds = Math.abs(distanceMillis) / 1000;
	var minutes = seconds / 60;
	var hours = minutes / 60;
	var days = hours / 24;
	var years = days / 365;

	function substitute(stringOrFunction, number) {
		var string = typeof stringOrFunction === 'function' ? stringOrFunction(number, distanceMillis) : stringOrFunction;
		var value = ($text.numbers && $text.numbers[number]) || number;
		return string.replace(/%d/i, value);
	}

	var words = seconds < 45 && substitute($text.a_min, Math.round(seconds)) ||
		seconds < 90 && substitute($text.a_min, 1) ||
		minutes < 45 && substitute($text.d_mins, Math.round(minutes)) ||
		minutes < 90 && substitute($text.one_hour, 1) ||
		hours < 24 && substitute($text.d_hours, Math.round(hours)) ||
		hours < 48 && substitute($text.a_day, 1) ||
		days < 30 && substitute($text.d_days, Math.floor(days)) ||
		days < 60 && substitute($text.a_month, 1) ||
		days < 365 && substitute($text.d_months, Math.floor(days / 30)) ||
		years < 2 && substitute($text.a_year, 1) ||
		substitute($text.d_years, Math.floor(years));

	return [prefix, words, suffix].join(' ').toString().trim();
};

function parse(iso8601) {
	if (!iso8601) return;
	var s = iso8601.trim();
	s = s.replace(/\.\d\d\d+/, ''); // remove milliseconds
	s = s.replace(/-/, '/').replace(/-/, '/');
	s = s.replace(/T/, ' ').replace(/Z/, ' UTC');
	s = s.replace(/([\+\-]\d\d)\:?(\d\d)/, ' $1$2'); // -04:00 -> -0400
	return new Date(s);
}

$l.parse = parse;

function inWords(date, noAgo, localizedText) {
	if (typeof localizedText != 'undefined') {
		$text = mergeOptions($text, localizedText);
	}

	if (noAgo === true) $text.ago = null;
	return $l.inWords(distance(date));
}

function distance(date) {
	return (new Date().getTime() - date.getTime());
}

/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param obj1
 * @param obj2
 * @returns obj3 a new object based on obj1 and obj2
 */
function mergeOptions(obj1, obj2) {
	var obj3 = {};
	for (var attrname in obj1) {
		obj3[attrname] = obj1[attrname];
	}

	for (var attrname2 in obj2) {
		obj3[attrname2] = obj2[attrname2];
	}

	return obj3;
}
