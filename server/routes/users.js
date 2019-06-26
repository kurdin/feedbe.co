const express = require('express');
const app = express.Router();
const passwordless = require('passwordless');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const users = require('../controllers/users');

app.use(
	passwordless.restricted({
		failureRedirect: '/login',
		originField: 'origin'
	})
);

app.get('/view/:id', csrfProtection, users.view);
app.post('/add', csrfProtection, users.add);
app.put('/update/:id', csrfProtection, users.update);
app.put('/activate/:id', csrfProtection, users.activate);
app.delete('/remove/:id', csrfProtection, users.remove);

module.exports = app;
