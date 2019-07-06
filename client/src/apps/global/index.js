import React from 'react';
import { render } from 'react-dom';
import { AccountHeaderMenu } from './components/AccountHeaderMenu';

const userName = window.datashared && window.datashared.userName;
const userEmail = window.datashared && window.datashared.userEmail;

const accountHeader = document.getElementById('account-header-app');

if (accountHeader) {
	render(<AccountHeaderMenu {...{ userName, userEmail }} />, accountHeader);
}

if (process.env.NODE_ENV !== 'production') {
	if (module.hot) {
		module.hot.accept();
	}
}
