// const CacheRedis = require('cacheman-redis');
// const cache = new CacheRedis({ port: null, host: null });
import { render } from '../types';
import { User } from 'datalayer/models';

export const accountController = async (req, res) => {
	const user = await User.query().findById(req.session.userId);

	const model = {
		shared: {
			user,
			origin: req.query.origin
		}
	};

	render('account', model, res);
};
