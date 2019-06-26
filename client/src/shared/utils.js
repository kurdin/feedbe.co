/* global $ */
import flatAsync from 'flatasync';

const checkErrorProps = (lastProps, nextProps) => {
	return nextProps.submiting === true || lastProps.error !== nextProps.error;
};

const uniqueArr = arrArg => arrArg.filter((elem, pos, arr) => arr.indexOf(elem) === pos);

const emailRegex = /^$|^.+@[\w\d-]+\.[\w\d]+$/;

const cn = (strings = [], ...classes) => {
	let myClass = '';
	strings.forEach((s, i) => {
		myClass += s + (classes[i] || '');
	});

	return myClass.trim().replace(/\s+/g, ' ');
};

const scrollTo = (el, time = 600, offset = 0, cb = void 0) => {
	const $el = $(el);
	if (!$el.length) return;
	$('html, body').animate(
		{
			scrollTop: $el.offset().top + offset
		},
		time,
		cb
	);
};

const shallowCompare = (obj1, obj2) => Object.keys(obj1).length === Object.keys(obj2).length && Object.keys(obj1).every(key => obj1[key] === obj2[key]);

const slugify = text =>
	text
		.toString()
		.toLowerCase()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/&/g, '-and-') // Replace & with 'and'
		.replace(/[^\w-]+/g, '') // Remove all non-word chars
		.replace(/--+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, ''); // Trim - from end of text;

export { checkErrorProps, slugify, shallowCompare, scrollTo, emailRegex, uniqueArr, flatAsync, cn };
