const path = require('path');

module.exports = {
  development: {
    client: 'sqlite3',
    debug: true,
    useNullAsDefault: true,
    connection: {
      filename: path.join(__dirname, '../db-local/feedbe.db')
    },
    pool: {
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    }
  },
  // temp production sqlite
  production: {
    client: 'sqlite3',
    debug: true,
    useNullAsDefault: true,
    connection: {
      filename: path.join(__dirname, '../db-local/feedbe.db')
    },
    pool: {
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    }
  },

  production2: {
    client: 'postgresql',
    connection: {
      database: 'example'
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};
