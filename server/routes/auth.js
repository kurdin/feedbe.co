/*eslint camelcase: 0*/
import { twitterAuth } from '../config/socialAuth';
const express = require('express');
const passport = require('passport');
const request = require('request');

require('../controllers/user-auth').passport();

const app = express.Router();

const sendResponseJson = (req, res, next) => {
    if (!req.user) {
        req.flash('passwordless', true);
        return res.send(401, 'User Not Authenticated');
    }
    req.flash('passwordless-success', true);
    req.flash('userLoggedIn', req.user);

    res.status(200).json({ success: true });
};

app.post('/twitter/reverse', (req, res) => {
    request.post(
        {
            url: 'https://api.twitter.com/oauth/request_token',
            oauth: {
                oauth_callback: encodeURIComponent(twitterAuth.callbackURL),
                consumer_key: twitterAuth.consumerKey,
                consumer_secret: twitterAuth.consumerSecret
            }
        },
        (err, r, body) => {
            if (err) {
                return res.send(500, { message: err.message });
            }
            var jsonStr = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
            res.send(JSON.parse(jsonStr));
        }
    );
});

app.get('/twitter/callback', (req, res) => {
    res.send('Your Twitter account has been verifyed...');
});

app.post(
    '/twitter',
    (req, res, next) => {
        request.post(
            {
                url: `https://api.twitter.com/oauth/access_token?oauth_verifier`,
                oauth: {
                    consumer_key: twitterAuth.consumerKey,
                    consumer_secret: twitterAuth.consumerSecret,
                    token: req.query.oauth_token
                },
                form: { oauth_verifier: req.query.oauth_verifier }
            },
            (err, r, body) => {
                if (err) {
                    return res.send(500, { message: err.message });
                }

                const bodyString = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
                const parsedBody = JSON.parse(bodyString);

                req.body['oauth_token'] = parsedBody.oauth_token;
                req.body['oauth_token_secret'] = parsedBody.oauth_token_secret;
                req.body['user_id'] = parsedBody.user_id;

                next();
            }
        );
    },
    passport.authenticate('twitter-token', { session: false }),
    sendResponseJson
);

app.post('/facebook', passport.authenticate('facebook-token', { session: false }), sendResponseJson);

app.post('/google', passport.authenticate('google-token', { session: false }), sendResponseJson);

module.exports = app;
