module.exports = {
	chat : require('./chat.dust'),
	'report-popup' : require('./report-popup.dust'),
	sidemenu : {
		leftright: require('./sidemenu/leftright.dust')
	},
	toolbar : {
		main: require('./toolbar/main.dust'),
		htmlvalidate: require('./toolbar/htmlvalidate.dust'),
		pagespeed: require('./toolbar/pagespeed.dust'),
		spellchecker: require('./toolbar/spellchecker.dust')
	}
}



