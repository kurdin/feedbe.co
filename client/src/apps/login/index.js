/* globals window */

import { hydrate, render } from 'react-dom';
import React from 'react';
import Login from './components/Login';
// import Account from './components/Account';

const email = window.datashared && window.datashared.userEmail;
const name = window.datashared && window.datashared.userName;
const data = window.datashared && window.datashared.userData;
const isAdmin = window.datashared && window.datashared.userIsAdmin;
const userProviders = window.datashared && window.datashared.userProviders;

const loginApp = document.getElementById('login-app');
const accountApp = document.getElementById('account-app');

const Account = () => <div>Account</div>;

window.isClient = true;
window.isServer = false;

if (loginApp) {
	if (process.env.NODE_ENV !== 'production') {
		render(<Login origin={origin} />, loginApp);
	} else {
		hydrate(<Login origin={origin} />, loginApp);
	}
} else if (accountApp) {
	hydrate(<Account {...{ email, isAdmin, name, data, userProviders }} />, accountApp);
}

if (process.env.NODE_ENV !== 'production') {
	if (module.hot) {
		module.hot.accept();
	}
}
