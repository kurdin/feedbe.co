const express = require('express');
const app = express.Router();
const passwordless = require('passwordless');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const controller = require('../controllers/providers');

app.use(
	passwordless.restricted({
		failureRedirect: '/login',
		originField: 'origin'
	})
);

app.get('/view/:id', csrfProtection, controller.providerView);
app.post('/add', csrfProtection, controller.providerAdd);
app.put('/update/:id', csrfProtection, controller.providerUpdate);
app.put('/activate/:id', csrfProtection, controller.providerActivate);
app.delete('/remove/:id', csrfProtection, controller.providerRemove);

module.exports = app;
