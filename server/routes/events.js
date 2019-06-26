const express = require('express');
const app = express.Router();
const passwordless = require('passwordless');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const controller = require('../controllers/events');

app.use(
	passwordless.restricted({
		failureRedirect: '/login',
		originField: 'origin'
	})
);

app.get('/view/:id', csrfProtection, controller.eventView);
app.post('/add', csrfProtection, controller.eventAdd);
app.put('/update/:id', csrfProtection, controller.eventUpdate);
app.put('/activate/:id', csrfProtection, controller.eventActivate);
app.delete('/remove/:id', csrfProtection, controller.eventRemove);

module.exports = app;
