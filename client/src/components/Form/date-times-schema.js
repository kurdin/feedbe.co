import schema from 'shared/validate';
import moment from 'moment';

const NewDateTimesSchema = new schema({
  date: [
    {
      type: 'string',
      required: true,
      message: 'Event Date is required'
    },
    {
      check: (date) => {
        const dateMoment = moment(date, ['MM/DD/YYYY', 'MMM DD, YYYY', 'MMM D, YYYY', 'MM-DD-YYYY'], true);
        return dateMoment.isValid() && dateMoment.isSameOrAfter(new Date()) ? true : false;
      },
      message: 'Event`s Date is incorrect'
    }
  ],
  timeFrom: {
    type: 'string',
    required: true,
    message: 'Event time from is required'
  },
  timeTo: {
    type: 'string',
    required: true,
    message: 'Event time to is required'
  }
});

export default NewDateTimesSchema;
