import React from 'react';
import { _extend } from 'util';

import { /*renderToStaticMarkup, */ renderToString } from 'react-dom/server';

import { StaticRouter } from 'react-router';
import { AdminRoutes } from './AdminRoutes';

declare const global: {
	isClient: boolean;
	isServer: boolean;
};

global.isClient = false;
global.isServer = true;

export default function AdminServer(props, url, res) {
	url = props.baseUrl ? url.replace(new RegExp('^' + props.baseUrl), '') : url;
	// console.log('_extend', _extend.toString());
	const _props = _extend({ isServer: true }, props);

	const context = {};
	const content = renderToString(
		<StaticRouter basename={props.baseUrl} location={url} context={context}>
			<AdminRoutes {..._props} baseUrl={props.baseUrl} />
		</StaticRouter>
	);

	if (context.url) {
		res.redirect(props.baseUrl ? props.baseUrl + context.url : context.url);
		return { redirect: context.url };
	}

	return content;
}
