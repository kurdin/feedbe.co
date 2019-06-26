'use strict';

var truncate = require('html-truncate');
var sanitizer = require('insane');
var BBparser = require('../../bbcodes_messages')();

module.exports = function (dust) {
	dust.filters.cut250 = function (value) {
		return truncate(value, 250, {
			ellipsis: '...'
		}).trim();
	};

	dust.filters.removeDoubleLine = function (value) {
		return value.replace(/^\s*[\r\n]{2,}/gm, '\n'); // remove empty new lines in quotes
	};

	dust.filters.addTabulationNewLine = function (value) {
		return value.replace(/[\r\n]/gm, '\n\t'); // remove empty new lines in quotes
	};

	dust.filters.cut100 = function (value) {
		return truncate(value, 100, {
			ellipsis: '...'
		}).trim();
	};

	dust.filters.cut10 = function (value) {
		return truncate(value, 10).trim();
	};

	dust.filters.messageHTML = function (value) {
		value = value.replace(/(\[(img|link)\].?)?(https?:\/\/(?:(?!&[^;]+;)[^\s\"\'<>\[)])+)(.?\[.*\])?/gmi, function (match, p1, p2, p3) {
			return (p1 || p2) ? match : '[link]' + p3 + '[/link]';
		});
		value = BBparser.parseString(value);
		value = value.replace(/(?:\r\n|\r|\n)/g, '<br />');
		value = value.replace(/\<blockquote\>\<br.?\/?\>/gm, '<blockquote>').replace(/\<\/blockquote\>\<br.?\/?\>/gm, '</blockquote>');
		value = sanitizer(value, {
			allowedTags: ['b', 'i', 'span', 'p', 'div', 'br', 'pre', 'img', 'a', 'code', 'blockquote'],
			allowedAttributes: {
				span: ['id', 'class'],
				div: ['class']
			}
		});
		return value;
	};

	dust.filters.messageTitle = function (value) {
		return value.replace(/(\[\/?[^\]].*?(\]|\.\.\.))+/gi, '');
	};

	dust.filters.removeBR = function (value) {
		return value.replace(/(<\/?br\ ?\/?>)+/gi, '');
	};

	dust.filters.roundRating = function (rating) {
		return rating > 0 && rating * 10 || 0;
	};
};