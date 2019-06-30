import BaseModel from './BaseModel';
import { createToken } from 'common/middlewares';
import Password from 'datalayer/libs/objection-password';

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

export default class User extends Password({ allowEmptyPassword: true })(BaseModel) {
  static tableName = 'users';

  readonly id!: string;
  username: string;
  email!: string;
  password: string;

  static jsonSchema = {
    type: 'object',
    required: ['email'],
    properties
  };

  get token(): string {
    return createToken({ username: this.username, email: this.email, id: this.id });
  }
}
