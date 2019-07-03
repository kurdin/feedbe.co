import { Model } from 'objection';
import uuid from 'uuid/v4';
import visibilityPlugin from 'objection-visibility';

export default class BaseModel extends visibilityPlugin(Model) {
  id!: string;
  createdAt!: string;
  updatedAt!: string;
  deletedAt!: string;
  isDeleted: boolean;

  $beforeInsert(context) {
    const maybePromise = super.$beforeInsert(context);

    return Promise.resolve(maybePromise).then(() => {
      this.id = this.id || uuid();
      this.createdAt = new Date().toISOString();
      this.updatedAt = new Date().toDateString();
    });
  }

  $beforeUpdate(opt, context) {
    const maybePromise = super.$beforeUpdate(opt, context);

    return Promise.resolve(maybePromise).then(() => {
      this.updatedAt = new Date().toDateString();

      if (this.isDeleted) {
        this.deletedAt = new Date().toISOString();
      }
    });
  }

  $beforeDelete() {
    this.deletedAt = new Date().toISOString();
  }

  $parseDatabaseJson(json: object) {
    json = super.$parseDatabaseJson(json);
    toDate(json, 'createdAt');
    toDate(json, 'updatedAt');
    return json;
  }

  $formatDatabaseJson(json: object) {
    json = super.$formatDatabaseJson(json);
    toTime(json, 'createdAt');
    toTime(json, 'updatedAt');
    return json;
  }
}

function toDate(obj: any, fieldName: string): any {
  if (obj != null && typeof obj[fieldName] === 'number') {
    obj[fieldName] = new Date(obj[fieldName]);
  }
  return obj;
}

function toTime(obj: any, fieldName: string): any {
  if (obj != null && obj[fieldName] != null && obj[fieldName].getTime) {
    obj[fieldName] = obj[fieldName].getTime();
  }
  return obj;
}
