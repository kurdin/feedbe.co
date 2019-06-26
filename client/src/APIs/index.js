/* globals $, isClient */
const _getCSRF = () => isClient && window.datashared && window.datashared.csrfToken;

const ajaxPromise = ({ url, type, email, data }) => {
	const _csrf = _getCSRF();
	return new Promise((resolve, reject) => {
		$.ajax({
			url,
			type,
			data: type !== 'GET' && JSON.stringify({ _csrf, email, ...data }),
			dataType: 'json',
			contentType: 'application/json; charset=utf-8',
			success: resolve,
			error: reject
		});
	});
};

// Providers APIs
const getProvider = ({ providerId }) => {
	const url = `/providers/view/${providerId}`;
	const type = 'GET';
	return ajaxPromise({ url, type });
};

const activateProvider = ({ email, providerId, active, userId }) => {
	const url = `/providers/activate/${providerId}`;
	const type = 'PUT';
	const data = { active, userId };
	return ajaxPromise({ url, type, email, data });
};

const deleteProvider = ({ email, providerId, userId }) => {
	const url = `/providers/remove/${providerId}`;
	const type = 'DELETE';
	const data = { providerId, userId };
	return ajaxPromise({ url, type, email, data });
};

const addProvider = ({ email, form, userId }) => {
	const url = `/providers/add`;
	const type = 'POST';
	const data = { form, userId };
	return ajaxPromise({ url, type, email, data });
};

const updateProvider = ({ email, form, userId }) => {
	const url = `/providers/update/${form.$loki}`;
	const type = 'PUT';
	const data = { form, userId };
	return ajaxPromise({ url, type, email, data });
};

// Events APIs

const getEvent = ({ eventId }) => {
	const url = `/events/view/${eventId}`;
	const type = 'GET';
	return ajaxPromise({ url, type });
};

const activateEvent = ({ email, eventId, active, userId }) => {
	const url = `/events/activate/${eventId}`;
	const type = 'PUT';
	const data = { active, userId };
	return ajaxPromise({ url, type, email, data });
};

const deleteEvent = ({ email, eventId, userId }) => {
	const url = `/events/remove/${eventId}`;
	const type = 'DELETE';
	const data = { eventId, userId };
	return ajaxPromise({ url, type, email, data });
};

const addEvent = ({ email, form, userId }) => {
	const url = `/events/add`;
	const type = 'POST';
	const data = { form, userId };
	return ajaxPromise({ url, type, email, data });
};

const updateEvent = ({ email, form, userId }) => {
	const url = `/events/update/${form.$loki}`;
	const type = 'PUT';
	const data = { form, userId };
	return ajaxPromise({ url, type, email, data });
};

// Users APIs

const getUser = ({ uid }) => {
	const url = `/users/view/${uid}`;
	const type = 'GET';
	return ajaxPromise({ url, type });
};

const activateUser = ({ email, uid, active, userId }) => {
	const url = `/users/activate/${uid}`;
	const type = 'PUT';
	const data = { active, userId };
	return ajaxPromise({ url, type, email, data });
};

const deleteUser = ({ uid, userId }) => {
	const url = `/users/remove/${uid}`;
	const type = 'DELETE';
	const data = { uid, userId };
	return ajaxPromise({ url, type, data });
};

const addUser = ({ form }) => {
	const url = `/users/add`;
	const type = 'POST';
	const data = { form };
	return ajaxPromise({ url, type, data });
};

const updateUser = ({ email, form, userId }) => {
	const url = `/users/update/${form.$loki}`;
	const type = 'PUT';
	const data = { form, userId };
	return ajaxPromise({ url, type, email, data });
};

// ZIPS

const getZipsAutoComplete = ({ zip }) => {
	const url = `/zip/autocomplete/${zip}`;
	const type = 'GET';
	return ajaxPromise({ url, type });
};

export default {
	deleteProvider,
	addProvider,
	updateProvider,
	activateProvider,
	activateEvent,
	deleteEvent,
	addEvent,
	updateEvent,
	getEvent,
	getProvider,
	updateUser,
	addUser,
	deleteUser,
	activateUser,
	getUser,
	getZipsAutoComplete
};
