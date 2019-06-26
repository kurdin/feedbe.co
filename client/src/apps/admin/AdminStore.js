let store = {};

if (typeof window !== 'undefined') {
	store = !window.datashared
		? {}
		: {
				providers: window.datashared.providers || [],
				users: window.datashared.users || [],
				events: window.datashared.events || [],
				email: window.datashared.userEmail,
				name: window.datashared.userName,
				data: window.datashared.userData
		  };
}

export default store;
