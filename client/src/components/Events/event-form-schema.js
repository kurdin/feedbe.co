import schema from 'shared/validate';
import moment from 'moment';
import { emailRegex } from 'shared/utils';

const FormSchema = new schema({
  name: [
    {
      type: 'string',
      required: true,
      message: 'Event Name is required'
    },
    {
      check: function(val) {
        if (val && val.length >= 100) return false;
        return true;
      },
      message: 'Event Name maximum length is 100'
    }
  ],
  datesTimes: [
    {
      check: (arr = [{}]) => {
        return arr.every(event => {
          return !(!event.date || !event.timeFrom || !event.timeTo);
        });
      },
      message: 'Event`s Date and Times are required'
    },
    {
      check: (arr = [{}]) => {
        return arr.every(event => {
          const dateMoment = moment(event.date, ['MM/DD/YYYY', 'MMM DD, YYYY', 'MM-DD-YYYY']);
          return dateMoment.isValid() && event.timeFrom && event.timeTo;
        });
      },
      message: 'Event`s Date or Times are incorrect'
    }
  ],
  cost: {
    type: 'string',
    required: true,
    message: 'Cost per child is required, enter $0 for Free or Members only events'
  },
  description: [
    {
      type: 'string',
      required: true,
      message: 'Event description is required'
    },
    {
      check: function(val) {
        if (val && val.length > 2000) return false;
        return true;
      },
      message: 'Event description length limit is 2000 characters'
    }
  ],
  location: {
    type: 'string',
    required: true,
    message: 'Location address is required'
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
  provider: {
    check: (provider = {}) => {
      if (!provider.id || !provider.name) return false;
      return true;
    },
    message: 'Select Provider for Event'
  },
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

export default FormSchema;
