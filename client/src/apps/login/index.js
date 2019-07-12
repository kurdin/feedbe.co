/* globals window */

import { hydrate, render, unmountComponentAtNode } from 'react-dom';
import React from 'react';
import { LoginRouter } from './LoginRoutes';

const loginApp = document.getElementById('login-app');

window.isClient = true;
window.isServer = false;

if (loginApp) {
	if (process.env.NODE_ENV !== 'production') {
		render(<LoginRouter origin={origin} />, loginApp);
	} else {
		hydrate(<LoginRouter origin={origin} />, loginApp);
	}
}

// unmount component before pjax
$(document).one('pjax:send', () => {
	if (loginApp) {
		unmountComponentAtNode(LoginRouter);
	}
});

if (process.env.NODE_ENV !== 'production') {
	if (module.hot) {
		module.hot.accept();
	}
}
