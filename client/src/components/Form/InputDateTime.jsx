import { Component } from 'react';

import { Tooltip } from 'shared/inferno-tippy/src/';
import { DayPicker } from 'shared/day-picker';
import MaskedInput from 'shared/masked-input';
import { checkErrorProps, cn } from 'shared/utils';

import moment from 'moment';
import addClass from 'classnames';

import 'shared/day-picker/style.css';
import DateTimesSchema from './date-times-schema';
import ErrorHelper from './ErrorHelper';

const ADD_DATE_PERIOD = ['week', 'month', 'day'];
const TIME_FORMAT = 'h:mm A';
const TIME_FORMAT_MASK = ['hh:mm A', 'HH:mm A'];

let TIMES = [
  '6:00 AM',
  '6:30 AM',
  '7:00 AM',
  '7:30 AM',
  '8:00 AM',
  '8:30 AM',
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 AM',
  '12:30 AM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
  '5:00 PM',
  '5:30 PM',
  '6:00 PM',
  '6:30 PM',
  '7:00 PM',
  '7:30 PM',
  '8:00 PM',
  '8:30 PM',
  '9:00 PM',
  '9:30 PM',
  '10:00 PM'
];

const DEFAULT_TIMES = {
  timeFrom: '6:00 AM',
  timeTo: '6:00 PM'
};
// const timeMask = [/\d/, /\d/, /\d/, /\d/, /\d/];

function timeMask(value) {
  const hours = [/[0-9]/, /\d/];

  const minutes = [/[0-5]/, /[0-9]/];
  const PMAM = [/P|A/i, /M/i];

  return hours
    .concat(':')
    .concat(minutes)
    .concat(' ')
    .concat(PMAM);
}

class InputDateTime extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dateTimes: this.props.dateTimes || {},
      addPeriod: 'week',
      errors: {}
    };
  }

  componentDidMount() {
    const { dateTimes, isEdit } = this.props;
    if (dateTimes && !isEmpty(dateTimes) && !isEdit) {
      let toValidate = [];
      ['date', 'timeFrom', 'timeTo'].forEach(field => {
        dateTimes[field] && toValidate.push(field);
      });
      if (toValidate.length > 0) this.handleCheckErrors(toValidate);
    }
  }

  handleCheckErrors = (input = false) => {
    if (this.props.isView) return;
    const errorsDate = DateTimesSchema.validate({ ...this.state.dateTimes });
    let dateErrors = {};
    errorsDate.forEach(err => {
      if (err.path.indexOf('.') > -1) {
        let er = err.path.split('.')[0];
        dateErrors[er] = dateErrors[er] === undefined || dateErrors[er] === null ? err.message : dateErrors[er];
      } else dateErrors[err.path] = err.message;
    });
    if (input) {
      const checkInputs = Array.isArray(input) ? input : [input];
      let inputsError = [];
      checkInputs.forEach(input => {
        if (typeof dateErrors[input] === 'undefined') dateErrors[input] = null;
        inputsError[input] = dateErrors[input];
        if (dateErrors[input] === this.state.errors[input]) {
          this.sendChanges();
          return true;
        }
      });

      this.setState(
        {
          errors: {
            ...this.state.errors,
            ...inputsError
          }
        },
        () => {
          this.sendChanges();
        }
      );
    } else {
      if (dateErrors !== this.state.errors) {
        this.setState(
          {
            errors: dateErrors
          },
          () => {
            this.sendChanges();
          }
        );
      } else {
        this.sendChanges();
      }
      if (dateErrors.length > 0) {
        return true;
      } else {
        return false;
      }
    }
  };

  handleInputDate = e => {
    const dateValMoment = moment(e.target.value, ['MM/DD/YYYY', 'MMM DD, YYYY', 'MMM D, YYYY', 'MM-DD-YYYY'], true);
    const isValid = dateValMoment.isValid() && dateValMoment.isSameOrAfter(new Date()) ? true : false;
    if (isValid) {
      this.setState(
        {
          dateTimes: {
            ...this.state.dateTimes,
            date: moment.utc(dateValMoment).format('ll')
          }
        },
        () => {
          this.handleCheckErrors('date');
        }
      );
    } else {
      this.setState({
        dateTimes: {
          ...this.state.dateTimes,
          date: e.target.value
        }
      });
    }
  };

  convertTimetoHHMM(time) {
    return moment(time, TIME_FORMAT_MASK, true).format(TIME_FORMAT);
  }

  handleAddTime = type => () => {
    const time = this.state.dateTimes[type] ? this.state.dateTimes[type] : DEFAULT_TIMES[type];
    const timeMoment = moment(time, TIME_FORMAT, true);

    if (timeMoment.isValid()) {
      if (timeMoment.format(TIME_FORMAT) === '1:30 AM') timeMoment.set({ h: 2, m: 0 });
      else timeMoment.minute(timeMoment.minute() >= 30 ? 30 : 0).add(30, 'minutes');
      const time = timeMoment.format(TIME_FORMAT);
      if (!TIMES.includes(time)) TIMES.push(time);
      this.setState(
        {
          [`enter${type}`]: false,
          dateTimes: {
            ...this.state.dateTimes,
            [type]: time
          }
        },
        () => {
          this.handleCheckErrors(type);
        }
      );
    }
  };

  handleSubstractTime = type => e => {
    const time = this.state.dateTimes[type] ? this.state.dateTimes[type] : DEFAULT_TIMES[type];
    const timeMoment = moment(time, TIME_FORMAT, true);

    if (timeMoment.minute() > 30) timeMoment.minute(60);
    else if (timeMoment.minute() < 30 && timeMoment.minute() !== 0) timeMoment.minute(30);

    if (timeMoment.isValid()) {
      this.setState(
        {
          [`enter${type}`]: false,
          dateTimes: {
            ...this.state.dateTimes,
            [type]: timeMoment.subtract(30, 'minutes').format(TIME_FORMAT)
          }
        },
        () => {
          this.handleCheckErrors(type);
        }
      );
    }
  };

  handleInputTimeBlur = type => e => {
    if (!this.state[`enter${type}`]) return;
    const timeMoment = moment(this.state.dateTimes[type], TIME_FORMAT_MASK, true);
    this.setState(
      {
        dateTimes: {
          ...this.state.dateTimes,
          [type]: timeMoment.isValid() ? timeMoment.format(TIME_FORMAT) : ''
        }
      },
      () => {
        this.handleCheckErrors(type);
      }
    );
  };

  handleInputTime = type => e => {
    const timeValMoment = moment(e.target.value, TIME_FORMAT_MASK, true);
    if (timeValMoment.isValid()) {
      const time = timeValMoment.format(TIME_FORMAT);
      if (!TIMES.includes(time)) TIMES.push(time);
      this.setState(
        {
          [`enter${type}`]: false,
          dateTimes: {
            ...this.state.dateTimes,
            [type]: time
          }
        },
        () => {
          this.handleCheckErrors(type);
        }
      );
    }
  };

  handleSelectTime = type => e => {
    const val = e.target.value;
    if (val === '0') return;
    if (val === '1') {
      return this.setState({
        [`enter${type}`]: true
      });
    }
    const timeValMoment = moment(val, TIME_FORMAT, true);
    this.setState(
      {
        dateTimes: {
          ...this.state.dateTimes,
          [type]: moment(timeValMoment).format(TIME_FORMAT)
        }
      },
      () => {
        this.handleCheckErrors(type);
      }
    );
  };

  handleDayChange = (selectedDay, modifiers) => {
    if (modifiers.disabled) return;
    this.setState(
      {
        dateTimes: {
          ...this.state.dateTimes,
          date: moment.utc(new Date(selectedDay)).format('ll')
        }
      },
      () => {
        this.handleCheckErrors('date');
      }
    );
    setTimeout(() => {
      this.setState(
        {
          closeCalendar: true
        },
        () => {
          this.setState({ closeCalendar: undefined });
        }
      );
    }, 100);
  };

  sendChanges() {
    const { dateTimes, errors } = this.state;
    this.props.onChange(this.props.idx, { dateTimes, errors });
  }

  handleChangeAddDataPeriod = e => {
    const addPeriod = e.target.value;
    this.setState({
      addPeriod
    });
  };

  render() {
    const { isLast, hasRemove, onAddDate, onRemoveDate, isError, isView = false, isEdit } = this.props;
    const { errors, closeCalendar, dateTimes, entertimeTo, entertimeFrom, addPeriod } = this.state;
    const {
      handleInputDate,
      handleInputTime,
      handleInputTimeBlur,
      convertTimetoHHMM,
      handleAddTime,
      handleChangeAddDataPeriod,
      handleSelectTime,
      handleSubstractTime
    } = this;

    const { date: dateValue, timeFrom, timeTo } = dateTimes;
    const noErrors = errors.date === null && errors.timeFrom === null && errors.timeTo === null ? true : false;
    const date = Date.parse(dateValue) ? new Date(dateValue) : undefined;
    const today = new Date();

    return (
      <div>
        <div class="columns m-b-0">
          <div
            class={addClass(
              {
                correct: errors.date === null && dateValue,
                'not-correct': errors.date || (isError && errors.date !== null)
              },
              'column is-four-fifths'
            )}
          >
            <label class="label m-0">
              Date <span class="check-done">&#245;</span>
            </label>

            <p class="control is-expanded has-icons-left">
              <Tooltip
                trigger="focus click"
                position="right"
                unmountHTMLWhenHide={true}
                hidden={() => this.handleCheckErrors('date')}
                animateFill={false}
                theme="light"
                disabled={isView}
                interactive={true}
                arrow={true}
                close={closeCalendar}
                popperOptions={{
                  modifiers: {
                    preventOverflow: {
                      boundariesElement: 'viewport'
                    }
                  }
                }}
                html={
                  <DayPicker
                    selectedDays={date}
                    onDayClick={this.handleDayChange}
                    fromMonth={today}
                    month={date}
                    disabledDays={{
                      before: today
                    }}
                    pagedNavigation
                  />
                }
              >
                <input
                  class={addClass({ 'is-danger': errors['date'] }, 'input')}
                  onInput={handleInputDate}
                  style={{ minWidth: 120, backgroundColor: isView && '#f6f6f6' }}
                  disabled={isView}
                  placeholder="Select Date"
                  value={dateValue}
                />
                <span class="icon is-small is-left">&#0059;</span>
              </Tooltip>
              <ErrorHelper error={errors['date']} onComponentShouldUpdate={checkErrorProps} />
            </p>
          </div>
          <div
            class={addClass(
              {
                correct: errors.timeFrom === null && timeFrom,
                'not-correct': errors.timeFrom || (isError && errors.timeFrom !== null)
              },
              'column is-full-mobile'
            )}
          >
            <p class="control has-icons-left is-expanded">
              <label class="label m-0">
                Time from <span class="check-done">&#245;</span>
              </label>

              <div class="field has-addons m-0">
                <p class="control is-fullwidth m-r-0">
                  {entertimeFrom ? (
                    <MaskedInput
                      class="input"
                      value={convertTimetoHHMM(timeFrom)}
                      onInput={handleInputTime('timeFrom')}
                      onBlur={handleInputTimeBlur('timeFrom')}
                      autofocus={true}
                      disabled={isView}
                      placeholder="__:__ AM"
                      mask={timeMask}
                    />
                  ) : (
                    <div class={cn`select is-fullwidth ${isView && 'disabled'}`}>
                      <select onChange={handleSelectTime('timeFrom')} disabled={isView} value={timeFrom || 0}>
                        <option value="0">Select Time</option>
                        {TIMES.map(time => (
                          <option value={time}>{time}</option>
                        ))}
                        <option value="1">Enter Time</option>
                      </select>
                    </div>
                  )}
                  <span class="icon is-left">&#0058;</span>
                </p>

                {!isView && [
                  <p class="control is-hidden-tablet-only">
                    <button class="button plus" onClick={handleAddTime('timeFrom')}>
                      <span class="icon">&#194;</span>
                    </button>
                  </p>,

                  <p class="control is-hidden-tablet-only">
                    <button class="button minus" onClick={handleSubstractTime('timeFrom')}>
                      <span class="icon">&#197;</span>
                    </button>
                  </p>
                ]}
              </div>
              <ErrorHelper error={errors['timeFrom']} onComponentShouldUpdate={checkErrorProps} />
            </p>
          </div>
          <div
            class={addClass(
              {
                correct: errors.timeTo === null && timeTo,
                'not-correct': errors.timeTo || (isError && errors.timeTo !== null)
              },
              'column is-full-mobile'
            )}
          >
            <p class="control has-icons-left">
              <label class="label m-0">
                Time to <span class="check-done">&#245;</span>
              </label>

              <div class="field has-addons">
                <p class="control is-fullwidth m-r-0">
                  {entertimeTo ? (
                    <MaskedInput
                      class="input"
                      value={convertTimetoHHMM(timeTo)}
                      onInput={handleInputTime('timeTo')}
                      onBlur={handleInputTimeBlur('timeTo')}
                      disabled={isView}
                      autofocus={true}
                      placeholder="__:__ AM"
                      mask={timeMask}
                    />
                  ) : (
                    <div class={cn`select is-fullwidth ${isView && 'disabled'}`}>
                      <select onChange={handleSelectTime('timeTo')} disabled={isView} value={timeTo || 0}>
                        <option value="0">Select Time</option>
                        {TIMES.map(time => (
                          <option value={time}>{time}</option>
                        ))}
                        <option value="1">Enter Time</option>
                      </select>
                    </div>
                  )}

                  <span class="icon is-left">&#0058;</span>
                </p>
                {!isView && [
                  <p class="control is-hidden-tablet-only">
                    <button class="button plus" onClick={handleAddTime('timeTo')}>
                      <span class="icon">&#194;</span>
                    </button>
                  </p>,

                  <p class="control is-hidden-tablet-only">
                    <button class="button minus" onClick={handleSubstractTime('timeTo')}>
                      <span class="icon">&#197;</span>
                    </button>
                  </p>
                ]}
              </div>
              <ErrorHelper error={errors['timeTo']} onComponentShouldUpdate={checkErrorProps} />
            </p>
          </div>
        </div>

        {isLast && (
          <div class="field is-clearfix m-b-10">
            <div class="columns is-mobile">
              <div class="column is-half">
                {(noErrors || isEdit) && (
                  <div class="field has-addons">
                    <p class="control">
                      <a href="/#" class="button is-md is-correct" onClick={onAddDate(addPeriod)}>
                        <span class="icon">&#0034;</span>
                        <span>Repeat Event Date </span>
                      </a>
                    </p>
                    <p class="control">
                      <span class="select is-md">
                        <select onChange={handleChangeAddDataPeriod} value={addPeriod}>
                          {ADD_DATE_PERIOD.map(period => (
                            <option value={period}>next {period}</option>
                          ))}
                        </select>
                      </span>
                    </p>
                  </div>
                )}
              </div>
              <div class="column is-half">
                {hasRemove && !isView && (
                  <a href="/#" class="button is-md is-pulled-right is-danger" onClick={onRemoveDate}>
                    <span class="icon">&#204;</span>
                    <span>Remove Last Date</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default InputDateTime;

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
