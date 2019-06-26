const express = require('express');
const app = express.Router();
const passwordless = require('passwordless');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const controller = require('../controllers/user');

app.use(
	passwordless.restricted({
		failureRedirect: '/login',
		originField: 'origin'
	})
);

// app.post('/', csrfProtection, controller.providerAdd);
app.put('/change/name', csrfProtection, controller.userChangeName);
app.put('/change/type', csrfProtection, controller.userChangeType);
// app.delete('/remove/:id', csrfProtection, controller.providerRemove);

module.exports = app;
