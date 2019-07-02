/* globals window */

import { render } from 'react-dom';
import React from 'react';
import Account from './components/Account';

const email = window.datashared && window.datashared.userEmail;
const name = window.datashared && window.datashared.userName;
const data = window.datashared && window.datashared.userData;
const isAdmin = window.datashared && window.datashared.userIsAdmin;
const userProviders = window.datashared && window.datashared.userProviders;

const accountApp = document.getElementById('account-app');

window.isClient = true;

render(<Account {...{ email, isAdmin, name, data, userProviders }} />, accountApp);

if (process.env.NODE_ENV !== 'production') {
	if (module.hot) {
		module.hot.accept();
	}
}
