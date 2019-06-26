const loki = require('lokijs');
const logger = require('colog');
const path = require('path');
const LokiFSStructuredAdapter = require('lokijs/src/loki-fs-structured-adapter');

let dbFile = path.resolve(__dirname, '../db/main.json');
let dbUsersFile = path.resolve(__dirname, '../db/users.json');

let Db = new loki(dbFile, {
  verbose: true,
  autosave: false,
  // autoload: true,
  // autosaveInterval: 1000,
  adapter: new LokiFSStructuredAdapter(),
  // autoloadCallback : databaseInitialize,
  autosaveCallback: () => {
    logger.info('Main Db autosaved');
  }
});

let DbUsers = new loki(dbUsersFile, {
  verbose: true,
  autosave: true,
  autosaveInterval: 5000,
  adapter: new LokiFSStructuredAdapter(),
  autosaveCallback: () => {
    logger.info('Users Db autosaved');
  }
});

const databaseInitialize = async (db, cb) => {
  const initCollection = collection => {
    return new Promise((resolve, reject) => {
      console.log(`${collection} collection is empty, lets add there something`);

      if (collection === 'users')
        db.addCollection(collection, { unique: ['email'], autoupdate: true });
      else db.addCollection(collection, { unique: ['id'] });

      db.saveDatabase(err => {
        if (err) return reject(err);
        console.log('saved empty db on init');
        resolve();
      });
    });
  };
  if (db.filename.includes('users.json') && db.getCollection('users') === null) {
    await initCollection('users');
    return cb();
  }

  if (db.filename.includes('main.json')) {
    if (db.getCollection('providers') === null) await initCollection('providers');
    if (db.getCollection('events') === null) await initCollection('events');
    return cb();
  }

  cb();
};

const loadDb = new Promise((resolve, reject) => {
  Db.loadDatabase({}, err => {
    if (err) {
      console.error('db load errors', err);
      return reject(err);
    }
    databaseInitialize(Db, () => {
      resolve({
        mainDb: Db,
        providers: Db.getCollection('providers'),
        events: Db.getCollection('events')
      });
    });
  });
});

const loadUsersDb = new Promise((resolve, reject) => {
  DbUsers.loadDatabase({}, err => {
    if (err) {
      return reject(err);
    }
    databaseInitialize(DbUsers, () => {
      resolve({
        usersDb: DbUsers,
        users: DbUsers.getCollection('users')
      });
    });
  });
});

// let Db = {
//   saveDb: () => {
//     snippetsDb.saveDatabase(function (e) {
//       console.log(e);
//       logger.warning('DB save error ', e);
//     });
//   }
// }

// let examplesCollection = Db.getCollection('codes');

// let Examples = {
//   collection: examplesCollection,
//   get: (id) => {
//     return examplesCollection.get(id);
//   },
//   all: () => {
//     return examplesCollection.find({ '$loki': { '$gt': 0 } });
//   },
//   update: (id) => {
//     return examplesCollection.get(id);
//   },
//   remove: (id) => {
//     return examplesCollection.remove(id);
//   },
//   insert: (example) => {
//     return examplesCollection.insert(example);
//   }
// }

module.exports = {
  loadDb,
  loadUsersDb
};
