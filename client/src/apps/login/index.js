/* globals window */

import { hydrate, render } from 'react-dom';
import React from 'react';
import Login from './components/Login.jsx';
// import Profile from './components/Profile.jsx';

const email = window.datashared && window.datashared.userEmail;
const name = window.datashared && window.datashared.userName;
const data = window.datashared && window.datashared.userData;
const isAdmin = window.datashared && window.datashared.userIsAdmin;
const userProviders = window.datashared && window.datashared.userProviders;

const loginApp = document.getElementById('login-app');
const profileApp = document.getElementById('profile-app');

const Profile = () => <div>Profile</div>;

window.isClient = true;
window.isServer = false;

if (loginApp) {
	if (process.env.NODE_ENV !== 'production') {
		render(<Login origin={origin} />, loginApp);
	} else {
		hydrate(<Login origin={origin} />, loginApp);
	}
} else if (profileApp) {
	hydrate(<Profile {...{ email, isAdmin, name, data, userProviders }} />, profileApp);
}

if (process.env.NODE_ENV !== 'production') {
	if (module.hot) {
		module.hot.accept();
	}
}
