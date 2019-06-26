'use strict';

/* globals bbparser */

var truncate = require('html-truncate');
var sanitizer = require('insane');
var ago = require('../../timeago');

// export const timeAgo = (...args) => {
// 	return ago(...args);
// };

export class timeAgoHelper {

	constructor(localizedText) {
		this.localizedText = localizedText;
	}

	ago(date, noAgo = false) {
		return ago(date, noAgo, this.localizedText);
	}	

}

export class JSXHelpers {

 constructor() {
    this.value = '';
  }

  get val() {
  	return this.value;
  }

  str(value) {
  	this.value = value;
  	return this;
  }

	cut250(value = null) {
		let val = value ? value : this.value;
		this.value = truncate(val, 250, {
			ellipsis: '...'
		}).trim();
		return this;
	}

	removeDoubleLine(value = null) {
		let val = value ? value : this.value;
		this.value = val.replace(/^\s*[\r\n]{2,}/gm, '\n');
		return this;
	}

	addTabulationNewLine(value = null) {
		let val = value ? value : this.value;
		this.value = val.replace(/[\r\n]/gm, '\n\t'); // remove empty new lines in quotes
		return this;
	}

	cut70(value = null) {
		let val = value ? value : this.value;
		this.value = truncate(val, 70, {
			ellipsis: '...'
		}).trim();
		return this;
	}

	cut100(value = null) {
		let val = value ? value : this.value;
		this.value = truncate(val, 100, {
			ellipsis: '...'
		}).trim();
		return this;
	}

	cut(number) {
		this.value = truncate(this.value, number, {ellipsis: '...'}).trim();
		return this;
	}

	cut11(value = null) {
		let val = value ? value : this.value;
		this.value = truncate(val, 11, {ellipsis: 'xxx'}).trim();
		return this;
	}

	cut10(value = null) {
		let val = value ? value : this.value;
		this.value = truncate(val, 10).trim();
		return this;
	}

	notficationHTML(value = null) {
		let val = value ? value : this.value;
		val = bbparser.parseString(val);
		val = value.replace(/(?:\r\n|\r|\n)/g, ' ');
		// value = value.replace(/\<blockquote\>\<br.?\/?\>/gm, '<blockquote>').replace(/\<\/blockquote\>\<br.?\/?\>/gm, '</blockquote>');

		this.value = sanitizer(value, {
			allowedTags: ['b', 'i', 'span', 'p', 'a'],
			allowedAttributes: {
				span: ['id', 'class']
			}
		});
		return this;
	}

	messageHTML(value = null) {
		let val = value ? value : this.value;
		val = val.replace(/(\[(img|link)\].?)?(https?:\/\/(?:(?!&[^;]+;)[^\s\"\'<>\[)])+)(.?\[.*\])?/gmi, function (match, p1, p2, p3) {
			return (p1 || p2) ? match : '[link]' + p3 + '[/link]';
		});
		val = bbparser.parseString(val);
		val = val.replace(/(?:\r\n|\r|\n)/g, '<br />');
		val = val.replace(/\<blockquote\>\<br.?\/?\>/gm, '<blockquote>').replace(/\<\/blockquote\>\<br.?\/?\>/gm, '</blockquote>');
		this.value = sanitizer(val, {
			allowedTags: ['b', 'i', 'span', 'p', 'div', 'br', 'pre', 'img', 'a', 'code', 'blockquote'],
			allowedAttributes: {
				span: ['id', 'class'],
				div: ['class']
			}
		});
		return this;
	}

	messageTitle(value = null) {
		let val = value ? value : this.value;
		this.value = val.replace(/(\[\/?[^\]].*?(\]|\.\.\.))+/gi, '');
		return this;
	}

	removeBR(value = null) {
		let val = value ? value : this.value;
		this.value = val.replace(/(<\/?br\ ?\/?>)+/gi, '');
		return this;
	}

	roundRating(value = null) {
		let val = value ? value : this.value;
		this.value = val > 0 && val * 10 || 0;
		return this;
	}
}