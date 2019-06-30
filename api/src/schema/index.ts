import { importSchema } from 'graphql-import';
import { mergeSchemas, makeExecutableSchema } from 'apollo-server';
import { applyMiddleware } from 'graphql-middleware';

import * as path from 'path';
import * as fs from 'fs';

const folders = fs.readdirSync(path.join(__dirname, './'));
const schemas = folders
	.map(folder => {
		const resolverPath = `./${folder}/${folder}Resolvers.ts`;
		if (!folder.includes('_off') && fs.existsSync(path.join(__dirname, resolverPath))) {
			const resolvers = require(`./${folder}/${folder}Resolvers`).default;
			const typeDefs = importSchema(path.join(__dirname, `./${folder}/${folder}Schema.graphql`));
			console.log(`Loaded Schema for ${folder}`);
			try {
				const middleware = require(`./${folder}/${folder}Middleware`).default;
				const applyMiddlewareArgs = Array.isArray(middleware) ? middleware : [middleware];
				return applyMiddleware(makeExecutableSchema({ resolvers, typeDefs }), ...applyMiddlewareArgs);
			} catch (e) {
				return makeExecutableSchema({ resolvers, typeDefs });
			}
		}
		return null;
	})
	.filter(schema => schema);

export default mergeSchemas({ schemas });
