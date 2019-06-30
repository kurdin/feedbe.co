exports.up = function(knex, Promise) {
	return knex.schema
		.createTable('users', table => {
			table
				.uuid('id')
				.notNullable()
				.primary();
			table.string('username');
			table.string('email').unique();
			table.string('password');
			table.boolean('isActive').defaultTo(true);
			table.dateTime('lastLogin');
			table.dateTime('createdAt');
			table.dateTime('updatedAt');
			table.dateTime('deletedAt');
			table.json('settings');
		})
		.createTable('persons', table => {
			table.increments('id').primary();
			table
				.integer('parentId')
				.unsigned()
				.references('id')
				.inTable('persons')
				.onDelete('SET NULL')
				.index();
			table.string('firstName');
			table.string('lastName');
			table.integer('age');
			table.json('address');
		})
		.createTable('movies', table => {
			table.increments('id').primary();
			table.string('name');
		})
		.createTable('animals', table => {
			table.increments('id').primary();
			table
				.integer('ownerId')
				.unsigned()
				.references('id')
				.inTable('persons')
				.onDelete('SET NULL')
				.index();
			table.string('name');
			table.string('species');
		})
		.createTable('persons_movies', table => {
			table.increments('id').primary();
			table
				.integer('personId')
				.unsigned()
				.references('id')
				.inTable('persons')
				.onDelete('CASCADE')
				.index();
			table
				.integer('movieId')
				.unsigned()
				.references('id')
				.inTable('movies')
				.onDelete('CASCADE')
				.index();
		});
};

exports.down = function(knex, Promise) {
	return knex.schema
		.dropTableIfExists('users')
		.dropTableIfExists('persons_movies')
		.dropTableIfExists('animals')
		.dropTableIfExists('movies')
		.dropTableIfExists('persons');
};
