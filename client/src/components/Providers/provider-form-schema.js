import { emailRegex } from 'shared/utils';

import schema from 'shared/validate';

const NewCodeFormSchema = new schema({
  name: [
    {
      type: 'string',
      required: true,
      message: 'Name is required'
    },
    {
      check: function(val) {
        if (val && val.length >= 70) return false;
        return true;
      },
      message: 'Name maximum length is 100'
    }
  ],
  about: {
    check: function(val) {
      if (val && val.length > 2000) return false;
      return true;
    },
    message: 'About provider information length limit is 2000 characters'
  },
  address: {
    type: 'string',
    required: true,
    message: 'Address is required'
  },
  zip: [
    {
      type: 'number',
      required: true,
      message: '5 digits Zip code is required'
    },
    {
      type: 'number',
      match: /^(\d{5})$/,
      message: 'Zip must be 5 digits'
    }
  ],
  phone: [
    {
      type: 'string',
      required: true,
      message: 'Phone is required'
    },
    {
      type: 'string',
      check: function(val) {
        if (val && val.indexOf('_') !== -1) return false;
        return true;
      },
      message: 'Phone must be 10 digits US number'
    }
  ],
  email: [
    {
      type: 'string',
      required: true,
      message: 'Email is required'
    },
    {
      type: 'string',
      match: emailRegex,
      message: 'Email is not valid'
    }
  ],
  active: {
    type: 'boolean'
  }
});

export default NewCodeFormSchema;
