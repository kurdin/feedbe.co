const knex = require('knex');
const knexConfigs = require('./knexfile');

const env = () => process.env.NODE_ENV || 'development';

export default knex(knexConfigs[env()]);
