import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import knex from './config/db';
import { Model } from 'objection';
import morgan from 'morgan';

import schema from './schema';
import context from './schema/context';
import errorResolver from './error-resolver';
import { API_URL, PORT } from './config/server-config';

const { NODE_ENV } = process.env;
const isDev = NODE_ENV !== 'production';

Model.knex(knex);

const app: express.Application = express()
	.use(cors())
	.use(morgan('dev'))
	.set('json spaces', 2);

const playground: object | boolean = isDev
	? {
			settings: {
				'editor.cursorShape': 'line',
				'editor.fontFamily': 'Source Code Pro',
				'editor.fontSize': 14,
				'schema.polling.enable': false,
				'editor.fontWeight': 300
			}
	  }
	: false;

const server = new ApolloServer({
	formatError: errorResolver,
	playground,
	schema,
	context
});

server.applyMiddleware({ app });

app.listen({ port: PORT }, () => {
	console.log(`GraphQl server is up and running on ${API_URL}`);
});
