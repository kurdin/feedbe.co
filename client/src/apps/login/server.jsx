import { _extend } from 'util';
import React from 'react';
import { /*renderToStaticMarkup, */ renderToString } from 'react-dom/server';
import Login from './components/Login';

global.isClient = false;
global.isServer = true;

module.exports = (props, url, res) => {
	url = props.baseUrl ? url.replace(new RegExp('^' + props.baseUrl), '') : url;
	const _props = _extend({ isServer: true }, props);

	const context = {};
	const content = renderToString(<Login {..._props} baseUrl={props.baseUrl} />);

	if (context.url) {
		res.redirect(props.baseUrl ? props.baseUrl + context.url : context.url);
		return { redirect: context.url };
	}

	return content;
};
