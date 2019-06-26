import moment from 'moment';
import truncate from './html-truncate';

export class JSXFilters {
	constructor() {
		this.value = '';
	}

	get val() {
		return this.value;
	}

	str(value = '') {
		this.value = value ? value : '';
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
		this.value = truncate(this.value, number, { ellipsis: '...' }).trim();
		return this;
	}

	removeBR(value = null) {
		let val = value ? value : this.value;
		this.value = val.replace(/(<\/?br ?\/?>)+/gi, '');
		return this;
	}

	roundRating(value = null) {
		let val = value ? value : this.value;
		this.value = (val > 0 && val * 10) || 0;
		return this;
	}

	moment(date, format) {
		return moment.utc(date, format);
	}
}
