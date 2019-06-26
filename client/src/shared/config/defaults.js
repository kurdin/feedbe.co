const faciltyTypeOptions = [
	'Day Care',
	'Sport Club',
	'Fun Zone',
	'After School',
	'Private House',
	'Kids Zone',
	'Public Place',
	'Child Care'
];

const activitiesOptions = [
	'Free Play',
	'Sports',
	'Science',
	'Technology',
	'Engineering',
	'Arts',
	'Math',
	'Fun',
	'Pizza'
];

const languagesOptions = [
	'English',
	'Spanish',
	'Chinese',
	'Korean',
	'Russian',
	'French',
	'Arabic',
	'Vietnamese'
];

const newProviderFormOptions = {
	iagree: false,
	hideExactAddress: true,
	active: true
};

const newEventFormOptions = {
	datesTimes: [{ date: null, timeFrom: null, timeTo: null }],
	active: true
};

const newUserFormOptions = {
	active: true
};

const pagerPerPage = [10, 20, 50, 100, 'All'];

export {
	faciltyTypeOptions,
	activitiesOptions,
	newEventFormOptions,
	newProviderFormOptions,
	pagerPerPage,
	newUserFormOptions,
	languagesOptions
};
