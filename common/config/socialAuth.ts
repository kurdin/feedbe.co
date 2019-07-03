/* globals globalHelper */

export const facebookAuth = {
	clientID: '366257574171895',
	clientSecret: '7c6104ea3e5c54d3ee1d3cf384fb6a1d',
	callbackURL: `${globalHelper.host}/auth/facebook/callback`,
	profileURL: 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email'
};

export const twitterAuth = {
	consumerKey: 'IzdaRG4bJ2XM7x6LgCPke5yfW',
	consumerSecret: 'v3ZGKByHMiDE7YyotOvkFollyabAkWAm1vBRe3MxPy90VwZz6v',
	callbackURL: `${globalHelper.host}/auth/twitter/callback`
};

export const googleAuth = {
	clientID: '131777512320-napdjp591f8n3sum5919epnbcnma10v8.apps.googleusercontent.com',
	clientSecret: 'EogsTmOh6649R6zWvPHkyCm1',
	callbackURL: `${globalHelper.host}/auth/google/callback`
};
