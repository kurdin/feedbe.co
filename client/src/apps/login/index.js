/* globals window */

import { hydrate, render, unmountComponentAtNode } from 'react-dom';
import React from 'react';
import Login from './components/Login';
// import Account from './components/Account';

const loginApp = document.getElementById('login-app');

window.isClient = true;
window.isServer = false;

if (loginApp) {
	if (process.env.NODE_ENV !== 'production') {
		render(<Login origin={origin} />, loginApp);
	} else {
		hydrate(<Login origin={origin} />, loginApp);
	}
}

// unmount component before pjax
$(document).one('pjax:send', () => {
	if (loginApp) {
		unmountComponentAtNode(loginApp);
	}
});

if (process.env.NODE_ENV !== 'production') {
	if (module.hot) {
		module.hot.accept();
	}
}
