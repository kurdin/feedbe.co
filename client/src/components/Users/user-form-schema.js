import schema from 'shared/validate';
import { emailRegex } from 'shared/utils';

const FormSchema = new schema({
  name: [
    {
      type: 'string',
      required: true,
      message: 'User Name is required'
    },
    {
      check: function(val) {
        if (val && val.length >= 100) return false;
        return true;
      },
      message: 'User Name maximum length is 100'
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

export default FormSchema;
