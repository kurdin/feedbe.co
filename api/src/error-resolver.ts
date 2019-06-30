export default function errorResolver(err: {
	message?: string;
}): { message?; errorMessage?: string; errorCode?: string } {
	if (err.message && err.message.includes(':')) {
		const [errorCode, errorMessage] = err.message.split(':');
		return {
			...err,
			errorCode,
			errorMessage: errorMessage.trim()
		};
	}
	return err;
}
