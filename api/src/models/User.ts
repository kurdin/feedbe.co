import BaseModel from './BaseModel';
import { createToken } from '../middlewares/auth';
import Password from 'objection-password';

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

export default class User extends Password()(BaseModel) {
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
