/* globals window */

import { render, unmountComponentAtNode } from 'react-dom';
import React from 'react';
import { AccountRouter } from './AccountRoutes';

const email = window.datashared && window.datashared.userEmail;
const name = window.datashared && window.datashared.userName;
const data = window.datashared && window.datashared.userData;
const isAdmin = window.datashared && window.datashared.userIsAdmin;
const userProviders = window.datashared && window.datashared.userProviders;

const accountApp = document.getElementById('account-app');

window.isClient = true;

render(<AccountRouter {...{ email, isAdmin, name, data, userProviders }} />, accountApp);

// unmount component before pjax
$(document).one('pjax:send', () => {
	if (accountApp) {
		unmountComponentAtNode(accountApp);
	}
});

if (process.env.NODE_ENV !== 'production') {
	if (module.hot) {
		module.hot.accept();
	}
}
