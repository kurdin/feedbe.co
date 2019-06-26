/* globals globalHelper */
const host = globalHelper.host;

module.exports = {
	facebookAuth: {
		clientID: '366257574171895',
		clientSecret: '7c6104ea3e5c54d3ee1d3cf384fb6a1d',
		callbackURL: `${host}/auth/facebook/callback`,
		profileURL: 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email'
	},

	twitterAuth: {
		consumerKey: 'IzdaRG4bJ2XM7x6LgCPke5yfW',
		consumerSecret: 'v3ZGKByHMiDE7YyotOvkFollyabAkWAm1vBRe3MxPy90VwZz6v',
		callbackURL: `${host}/auth/twitter/callback`
	},

	googleAuth: {
		clientID: '131777512320-napdjp591f8n3sum5919epnbcnma10v8.apps.googleusercontent.com',
		clientSecret: 'EogsTmOh6649R6zWvPHkyCm1',
		callbackURL: `${host}/auth/google/callback`
	}
};
