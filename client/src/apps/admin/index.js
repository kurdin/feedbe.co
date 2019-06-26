/* globals window */
import { AdminRouter } from './AdminRoutes';
import './admin.css';

import { hydrate, render } from 'react-dom';

window.isClient = true;
window.isServer = false;

const adminApp = document.getElementById('admin');

if (process.env.NODE_ENV !== 'production') {
	render(<AdminRouter />, adminApp);
} else {
	hydrate(<AdminRouter />, adminApp);
}

if (process.env.NODE_ENV !== 'production') {
	if (module.hot) {
		module.hot.accept();
	}
}
