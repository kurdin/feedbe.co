import BaseModel from './BaseModel';
import { createToken } from 'common/middlewares';

const Bcrypt = require('bcrypt');
const RECOMMENDED_ROUNDS = 12;
const PASSWORD_FIELD = 'password';
const REGEXP = /^\$2[ayb]\$[0-9]{2}\$[A-Za-z0-9./]{53}$/;

const username = {
  type: 'string',
  minLength: 3,
  maxLength: 255
};

const password = {
  type: 'string',
  minLength: 6,
  maxLength: 255
};

const properties = {
  username,
  password
};

export class User extends BaseModel {
  static tableName = 'users';
  // static get visible() {
  //   return ['firstName', 'id']
  // }

  static get hidden() {
    return ['password'];
  }

  readonly id!: string;
  username: string;
  email!: string;
  password: string;

  static jsonSchema = {
    type: 'object',
    required: ['email'],
    properties
  };

  $beforeInsert(context) {
    const maybePromise = super.$beforeInsert(context);

    return Promise.resolve(maybePromise).then(() => {
      // hash the password
      return this.generateHash();
    });
  }

  $beforeUpdate(queryOptions, context) {
    const maybePromise = super.$beforeUpdate(queryOptions, context);

    return Promise.resolve(maybePromise).then(() => {
      if (queryOptions.patch && this[PASSWORD_FIELD] === undefined) {
        return;
      }

      // hash the password
      return this.generateHash();
    });
  }

  verifyPassword(_password: string) {
    return Bcrypt.compare(_password, this[PASSWORD_FIELD]);
  }

  /**
   * Generates a Bcrypt hash
   * @return {Promise.<(String|void)>}  returns the hash or null
   */
  generateHash() {
    const _password = this[PASSWORD_FIELD];

    if (_password) {
      if (this.isBcryptHash(_password)) {
        throw new Error('bcrypt tried to hash another bcrypt hash');
      }

      return Bcrypt.hash(password, RECOMMENDED_ROUNDS).then(hash => {
        this[PASSWORD_FIELD] = hash;
      });
    }

    return Promise.resolve();
  }

  /**
   * Detect rehashing for avoiding undesired effects
   * @param {String} str A string to be checked
   * @return {Boolean} True if the str seems to be a bcrypt hash
   */
  static isBcryptHash(str) {
    return REGEXP.test(str);
  }

  get token(): string {
    return createToken({ username: this.username, email: this.email, id: this.id });
  }
}
