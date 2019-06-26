/* globals */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import addClass from 'classnames';
import Animate from 'animate.css-react';
import flatAsync from 'flatasync';
import moment from 'moment';
import isEqual from 'lodash/isEqual';
import { format as timeago } from 'timeago.js';

import { checkErrorProps, cn, shallowCompare, scrollTo } from 'shared/utils';
import ErrorHelper from '../Form/ErrorHelper';
import Notification from 'components/Notification';

import FormSchema from './event-form-schema';
import emailMask from 'text-mask-addons/dist/emailMask';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { faciltyTypeOptions, activitiesOptions, languagesOptions, newEventFormOptions } from 'shared/config/defaults';

import {
	InputDateTime,
	InputField,
	InputTextArea,
	SelectSinglePlusMinusField,
	InputCheckBox,
	InputSelectField
} from '../Form';

import API from '../../APIs';
import Select from 'shared/inferno-select/src/Select.js';
import 'shared/inferno-select/src/example.css';

const numberMask = createNumberMask({
	prefix: '$',
	suffix: ''
});

class NewEventForm extends Component {
	static displayName = 'New Event Form';

	constructor(props) {
		super(props);
		this.defaults = {
			form: { ...JSON.parse(JSON.stringify(newEventFormOptions)), ...props.form },
			clearForm: false,
			submiting: false,
			registerButtonClick: false,
			errors: {}
		};

		if (props.isAdmin) this.defaults.form.iagree = true;

		const provider =
			props.form && props.form.provider
				? {
						label: props.form.provider.name,
						value: props.form.provider.id
				  }
				: null;

		this.state = {
			provider,
			...this.defaults
		};
		this.getEventData();
	}

	async getEventData() {
		const { $loki: eventId = null } = this.state.form;
		if (!eventId) return;
		let [err, result] = await flatAsync(API.getEvent({ eventId }));
		if (!err && result) {
			if (!isEqual(result, this.state.form)) {
				this.setState({
					updateCurrentEventNotification: true,
					updatedEventData: result
				});
			}
		}
	}

	componentWillReceiveProps(newProps) {
		if (newProps.isEdit !== this.props.isEdit) this.getEventData();
		if (this.state.updateCurrentEventNotification) {
			this.setState(
				{
					updateCurrentEventNotification: false,
					form: newProps.form
				},
				() => {
					scrollTo(this.newForm, 300);
				}
			);
		}
	}

	handleEventInfoUpdate = () => {
		this.props.onEventDataUpdate(this.state.updatedEventData);
	};

	handleForm = {
		tags: input => e => {
			if (this.props.isView) return;
			let form = this.state.form;
			form[input] = e.value;
			this.setState({ form });
		},
		checkbox: input => e => {
			let form = this.state.form;
			form[input] = e.target.checked;
			this.setState({ form });
		},
		input: (input, digits = false) => e => {
			let form = this.state.form;
			let val = digits && e.target.value !== '' ? parseInt(e.target.value.trim(), 10) : e.target.value;
			form[input] = val;
			this.setState({ form });
			if (e.target.value && this.state.errors[input]) this.handleCheckErrors(input)();
		},
		onChange: input => value => {
			let form = this.state.form;
			form[input] = value;
			this.setState({ form });
			if (value && this.state.errors[input]) this.handleCheckErrors(input)();
		}
	};

	handleAddDateTimes = period => e => {
		e.preventDefault();
		const { datesTimes } = this.state.form;
		const lastDate = [...datesTimes].map(i => ({ ...i })).pop();
		if (lastDate.date)
			lastDate.date = moment(lastDate.date, ['MM/DD/YYYY', 'MMM DD, YYYY', 'MMM D, YYYY', 'MM-DD-YYYY'], true)
				.add(1, period)
				.format('ll');
		datesTimes.push(lastDate);
		this.setState({
			form: {
				...this.state.form,
				datesTimes
			}
		});
	};

	handleRemoveDate = e => {
		e.preventDefault();
		const { datesTimes } = this.state.form;
		datesTimes.pop();
		this.setState({
			form: {
				...this.state.form,
				datesTimes
			}
		});
	};

	handleDatesTimesChange = (idx, { dateTimes, errors }) => {
		const { datesTimes } = this.state.form;
		if (errors.date === null && errors.timeFrom === null && errors.timeTo === null) {
			datesTimes[idx] = dateTimes;
		} else {
			datesTimes[idx].date =
				dateTimes.date && dateTimes.date !== datesTimes[idx].date ? dateTimes.date : datesTimes[idx].date;

			datesTimes[idx].timeFrom =
				dateTimes.timeFrom && dateTimes.timeFrom !== datesTimes[idx].timeFrom
					? dateTimes.timeFrom
					: datesTimes[idx].timeFrom;

			datesTimes[idx].timeTo =
				dateTimes.timeTo && dateTimes.timeTo !== datesTimes[idx].timeTo ? dateTimes.timeTo : datesTimes[idx].timeTo;
		}
		this.setState(
			{
				form: {
					...this.state.form,
					datesTimes
				}
			},
			() => {
				if (this.state.errors.datesTimes) this.handleCheckErrors('datesTimes')();
			}
		);
	};

	componentDidMount() {
		if (this.props.scrollToForm) scrollTo(this.newForm, 300);
	}

	handleRegisterMouseClick = () => {
		this.setState({ registerButtonClick: true });
	};

	handleAgreeCheckbox = e => {
		e.preventDefault();
		this.setState({
			form: {
				...this.state.form,
				iagree: e.target.checked
			}
		});
	};

	handleCheckErrors = input => () => {
		const { isView, isRemove } = this.props;
		if (isView || isRemove) return;
		const errorsForm = FormSchema.validate({ ...this.state.form });
		let formErrors = {};
		let errors = { ...this.state.errors };
		errorsForm.forEach(err => {
			if (err.path.indexOf('.') > -1) {
				let er = err.path.split('.')[0];
				formErrors[er] = formErrors[er] === undefined || formErrors[er] === null ? err.message : formErrors[er];
			} else formErrors[err.path] = err.message;
		});
		if (input) {
			const inputArr = !Array.isArray(input) ? [input] : input;
			inputArr.forEach(input => {
				if (typeof formErrors[input] === 'undefined') {
					formErrors[input] = null;
				}
				errors = {
					...errors,
					[input]: formErrors[input]
				};
			});
			if (!shallowCompare(errors, this.state.errors)) {
				this.setState({
					errors
				});
			}
		} else {
			if (!shallowCompare(formErrors, errors)) {
				this.setState({
					errors: {
						...errors,
						...formErrors
					}
				});
			}
			if (errorsForm.length > 0) {
				return true;
			} else {
				return false;
			}
		}
	};

	handleActivateEvent = () => {
		const form = this.state.form;
		const email = this.props.email;
		const userId = this.props.data.id;

		const active = !form.active;

		this.setState({ submitingActivate: true }, async () => {
			let [err, result] = await flatAsync(API.activateEvent({ active, eventId: form.$loki, email, userId }));
			if (err) {
				this.setState({
					submitingActivate: false,
					submitingActivateError: true,
					submitError: 'Opps, Something Wrong! Please Try Again.'
				});
				return;
			}

			if (result) {
				setTimeout(() => {
					this.setState(
						{
							submitingActivate: false,
							form: result,
							submitingActivateError: true
						},
						() => {
							this.props.onActivate(result);
						}
					);
				}, 600);
			}
		});
	};

	handleRegistration = async e => {
		let { isView, isEdit, isRemove } = this.props;
		if (isView) return this.closeForm();
		if (isRemove && !window.confirm('Are you sure you want to REMOVE this Event?')) return;
		let hasErrors = this.handleCheckErrors(null)();
		if (!hasErrors) {
			this.setState({ submiting: true, submitError: null, changeProvider: false });
			const form = this.state.form;
			const email = this.props.email;
			const userId = this.props.data.id;

			let err;
			let result;

			if (isEdit) {
				[err, result] = await flatAsync(API.updateEvent({ email, form, userId }));
			} else if (isRemove) {
				[err, result] = await flatAsync(API.deleteEvent({ email, userId, eventId: form.$loki }));
			} else {
				[err, result] = await flatAsync(API.addEvent({ email, form, userId }));
			}

			if (err) {
				this.setState({
					submiting: false,
					submitError: 'Opps, Something Wrong! Please Try Again.'
				});
				return;
			}

			if (result) {
				this.setState(
					{
						...this.defaults
					},
					() => {
						this.props.onSubmit(result);
						scrollTo('body', 0);
					}
				);
			}
		} else {
			this.setState({ submiting: false, changeProvider: false });
		}
	};

	handleCancelCancelForm = e => {
		e.preventDefault();
		this.setState({
			clearForm: false
		});
	};

	handleProviderChange = () => {
		this.setState(prevState => ({
			changeProvider: !prevState.changeProvider
		}));
	};

	handleProviderChangeValue = val => {
		const { value: id, label: name } = val;
		const { form } = this.state;
		if (form.provider && form.provider.id !== id) {
			if (!window.confirm('Are you sure you want to CHANGE Provider for this Event?')) return;
		}

		const {
			address,
			hideExactAddress,
			zip,
			phone,
			cost,
			email,
			activities,
			languages,
			faciltyType,
			minAge,
			capacity
		} = this.props.providers.find(provider => id === provider.$loki);

		const providerData = {
			provider: {
				id,
				name
			},
			...(address && { location: address }),
			...(hideExactAddress && { hideExactAddress }),
			...(zip && { zip }),
			...(phone && { phone }),
			...(cost && !form.cost && { cost }),
			...(email && { email }),
			...(activities && !form.activities && { activities }),
			...(languages && !form.languages && { languages }),
			...(faciltyType && !form.faciltyType && { faciltyType }),
			...(minAge && !form.minAge && { minAge }),
			...(capacity && !form.capacity && { capacity })
		};

		this.setState(
			{
				form: {
					...form,
					...providerData
				},
				provider: val,
				changeProvider: false
			},
			() => {
				this.handleCheckErrors(Object.keys(providerData))();
			}
		);
	};

	handleCancelForm = e => {
		e.preventDefault();
		if (!this.state.clearForm) {
			this.setState({
				clearForm: true
			});
		} else this.closeForm();
	};

	handleEditEvent = () => {
		// scrollTo('body', 0);
		scrollTo(this.newForm, 300);
		this.props.onEdit();
	};

	closeForm() {
		this.setState({
			...this.defaults,
			form: { ...newEventFormOptions }
		});
		scrollTo('body', 0);
		this.props.onSubmit(null);
	}

	FormHeader = () => {
		let { addNew, isCopy, isEdit, isRemove, isView } = this.props;
		let { form, submitingActivate } = this.state;
		return !isView ? (
			<h3 class={`title is-3 m-0 has-text-centered ${isRemove ? 'is-danger' : isEdit || isCopy ? 'is-info' : ''}`}>
				{(addNew || isCopy) && 'New'}
				{isEdit && 'Edit'}
				{isRemove && 'Remove'} Provider's Event {isCopy && 'Copy From'}
				{addNew
					? 'Form'
					: form && (
							<div>
								ID: <b>{form.$loki}</b> added: <b>{timeago(form.created)}</b>
							</div>
					  )}
			</h3>
		) : (
			<h3 class={'title is-3 m-0 has-text-centered'}>
				Viewing Event ID: <b>{form.$loki}</b>
				<div>
					added: <b>{timeago(form.created)}</b>
				</div>
				<button onClick={this.handleEditEvent} class="button m-t-10 is-info is-small all-caps m-b-0">
					Edit Event
				</button>{' '}
				{form.active ? (
					<button
						onClick={this.handleActivateEvent}
						class={cn`button m-t-10 is-small is-danger all-caps m-b-0 ${submitingActivate && 'is-loading'}`}
					>
						Deactivate
					</button>
				) : (
					<button
						onClick={this.handleActivateEvent}
						class={cn`button m-t-10 is-small is-success all-caps m-b-0 ${submitingActivate && 'is-loading'}`}
					>
						Activate
					</button>
				)}{' '}
				<button onClick={this.handleRegistration} class="button m-t-10 close-provider is-small all-caps m-b-0">
					Close View
				</button>
			</h3>
		);
	};

	EventNotActive = ({ className }) => {
		return (
			!this.state.form.active && (
				<article class={cn`message is-danger m-b-10 ${className && className} `}>
					<div class="message-header flex-aligned-center">
						<p>
							<b>EVENT IS NOT ACTIVE</b>
						</p>
					</div>
				</article>
			)
		);
	};

	FormSubmitButton = () => {
		let { addNew, isCopy, isEdit, isRemove, isView } = this.props;
		return !isView ? (
			<span>
				{(addNew || isCopy) && 'Register New'}
				{isEdit && 'Update'}
				{isRemove && 'Remove This'} Event {isCopy && 'From Copy'}
				{isEdit && 'Registration'}
			</span>
		) : (
			<span> Close Event View </span>
		);
	};

	render() {
		const { addNew, isEdit, isCopy, providers, isRemove, isAdmin } = this.props;
		let { isView } = this.props;
		const {
			errors,
			clearForm,
			form,
			provider,
			submiting,
			registerButtonClick,
			changeProvider,
			submitError,
			updateCurrentEventNotification
		} = this.state;
		const {
			handleForm,
			handleRegistration,
			handleAgreeCheckbox,
			handleRegisterMouseClick,
			handleCancelForm,
			handleCancelCancelForm,
			handleCheckErrors,
			handleAddDateTimes,
			handleRemoveDate,
			handleDatesTimesChange,
			handleProviderChange,
			handleProviderChangeValue,
			FormHeader,
			FormSubmitButton,
			EventNotActive,
			handleEventInfoUpdate
		} = this;

		let hasErrors = Object.keys(errors).some(item => errors[item] !== null);
		const providersSelector = providers.map(provider => ({
			value: provider.$loki,
			label: provider.name
		}));

		if (isView && !form.$loki) return <div>No Event Found, Try Again</div>;
		if (isRemove) isView = true;

		return (
			<div class={`columns is-vcentered ${isView ? 'view-only' : ''}`} ref={ref => (this.newForm = ref)}>
				<div class="column is-8 is-offset-2 new-provider-form in-form">
					<EventNotActive />
					<FormHeader />
					<hr class="hr-text" data-content="Event's Provider" />
					<div
						class={cn`field
							${errors.provider === null && provider && !changeProvider && 'correct'} 
							${errors.provider && 'not-correct'}
					`}
					>
						{provider && provider.label && !changeProvider ? (
							<div>
								<div
									class={cn`field has-addons
							${errors.provider === null && provider && 'correct'} 
							${errors.provider && 'not-correct'}
					`}
								>
									{isAdmin && (
										<p class="control">
											<span class={`${isView ? 'tag is-medium' : 'button'} is-info`}>
												Provider ID: {provider.value}
												<Link to={`/providers/${provider.value}`} target="_blank">
													<span class="icon pointer" title="View Provider Info in New Tab">
														&#0064;
													</span>
												</Link>
											</span>
										</p>
									)}
									<p class="control is-expanded">
										<input
											style={{ marginLeft: isView ? 10 : null }}
											class="input disabled has-text-black"
											disabled={true}
											type="text"
											value={provider.label}
										/>
									</p>
									{!isView && (
										<p class="field">
											<button class="button is-correct" onClick={handleProviderChange}>
												Change Provider
											</button>
										</p>
									)}
								</div>
							</div>
						) : (
							<div>
								<label class="label m-0">
									Select Provider for Event <span class="check-done">&#245;</span>
								</label>
								<div class="field has-addons">
									<p class="control is-expanded m-0">
										<Select
											options={providersSelector}
											className={errors.provider && 'is-danger'}
											clearable={false}
											value={!changeProvider && provider && provider.label}
											multi={false}
											autofocus={changeProvider}
											onChange={handleProviderChangeValue}
											searchable={true}
											required={false}
											placeholder={'Type Name'}
										/>
									</p>
									{changeProvider && (
										<p class="field">
											<button class="button" onClick={handleProviderChange}>
												Cancel
											</button>
										</p>
									)}
								</div>
							</div>
						)}
					</div>
					<hr class="hr-text" data-content="Required Event's Information" />
					<InputField label="Event Name" name="name" {...{ errors, form, isView, handleForm, handleCheckErrors }} />
					{form.datesTimes.map((dateTimes, i) => (
						<InputDateTime
							isLast={form.datesTimes.length === i + 1}
							hasRemove={form.datesTimes.length > 1}
							name={'dateTimes_' + (i + 1)}
							{...{ dateTimes, isView, isEdit }}
							idx={i}
							isError={!!errors['datesTimes']}
							onAddDate={handleAddDateTimes}
							onRemoveDate={handleRemoveDate}
							onChange={handleDatesTimesChange}
						/>
					))}
					<ErrorHelper error={errors['datesTimes']} onComponentShouldUpdate={checkErrorProps} />
					<InputTextArea
						label="Description"
						placeholder="Enter Event Description"
						limit={2000}
						name="description"
						helpText="Tell parents more about your event. Describe what children do and why parents need to choose you."
						{...{ errors, form, handleForm, handleCheckErrors, isView }}
					/>
					<InputField
						label="Cost"
						placeholder="$"
						name="cost"
						showAsTagInView={true}
						showAsTagInViewClass="is-green"
						mask={numberMask}
						helpText="Event cost per child"
						{...{ errors, form, handleForm, handleCheckErrors, isView }}
					/>
					<hr class="hr-text" data-content="Required Event's Location Information" />
					<InputField
						label="Location"
						name="location"
						placeholder="Enter Location Address"
						{...{ errors, form, handleForm, handleCheckErrors, isView }}
					/>
					<InputCheckBox
						label="hide exact address from public"
						name="hideExactAddress"
						{...{ errors, form, handleForm, handleCheckErrors, isView }}
					/>
					<InputField
						label="Zip Code"
						name="zip"
						helpText="Make sure you enter correct 5 digits USA Zip code. This is how parents find your provider's events"
						placeholder="_____"
						digits={true}
						mask={[/\d/, /\d/, /\d/, /\d/, /\d/]}
						{...{ errors, form, handleForm, handleCheckErrors, isView }}
					/>
					<hr class="hr-text" data-content="Event's Contact Information" />
					<InputField
						label="Phone Number"
						name="phone"
						helpText="Make sure you enter correct phone. This is how parents contact you about your events"
						placeholder="(___) ___-____"
						mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
						{...{ errors, form, handleForm, handleCheckErrors, isView }}
					/>
					<InputField
						label="Email Address"
						placeholder="name@domain.com"
						name="email"
						mask={emailMask}
						{...{ errors, form, handleForm, handleCheckErrors, isView }}
					/>
					<hr class="hr-text" data-content="Event's Additional Information" />
					<InputSelectField
						label="Facilty Type"
						options={faciltyTypeOptions}
						maxSelectedItems={1}
						placeholder="Choose or enter new type"
						name="faciltyType"
						helpText="Facilty type where provider's events take place"
						{...{ errors, handleCheckErrors, form, handleForm, isView }}
					/>
					<InputSelectField
						label="Activity Categories"
						options={activitiesOptions}
						placeholder="Choose or enter new category"
						name="activities"
						helpText="Usual children's activities for your events"
						{...{ errors, handleCheckErrors, form, handleForm, isView }}
					/>
					<InputSelectField
						label="Languages"
						options={languagesOptions}
						placeholder="Choose or enter new language"
						name="languages"
						helpText="Usual languages kids use in your events"
						{...{ errors, form, handleCheckErrors, handleForm, isView }}
					/>
					<div class="columns">
						<div class="column is-4">
							<SelectSinglePlusMinusField
								label="Minimum Age"
								name="minAge"
								helpText="Children's minimum age allowed"
								maxValue={15}
								{...{ errors, form, handleCheckErrors, handleForm, isView }}
							/>
						</div>
						<div class="column is-4">
							<SelectSinglePlusMinusField
								label="Maximum Age"
								name="maxAge"
								helpText="Children's maximum age allowed"
								maxValue={15}
								{...{ errors, form, handleCheckErrors, handleForm, isView }}
							/>
						</div>
						<div class="column is-4">
							<SelectSinglePlusMinusField
								label="Maximum Capacity"
								helpText="Children's maximum number allowed"
								name="capacity"
								minValue={1}
								maxValue={30}
								{...{ errors, form, handleCheckErrors, handleForm, isView }}
							/>
						</div>
					</div>

					{!isAdmin && !isEdit && !isView && (
						<div class="field m-t-10">
							<p class="control m-0">
								<div class="ig-control">
									<input
										type="checkbox"
										id="i-agree"
										class="ig-control__cbx"
										checked={form.iagree}
										onChange={handleAgreeCheckbox}
									/>
									<label for="i-agree">
										I Agree to the{' '}
										<a href="/#" class="undeline">
											Terms and Conditions
										</a>{' '}
										and I have License or Permit
									</label>
								</div>
								<p class="help has-text-dark">
									By clicking `Register New Event` button, you agree to the{' '}
									<a href="/#" class="undeline">
										Terms and Conditions
									</a>{' '}
									set out by this site, including our Cookie Use. You confirm that you have active day care{' '}
									<u>License</u> or <u>Permit</u> from your local state. If you disagree or don't have active
									license/permit, please click `Cancel`
								</p>
							</p>
						</div>
					)}
					{isEdit && (
						<div class="field m-t-10">
							<p class="control m-0">
								<div class="ig-control">
									<input
										type="checkbox"
										id="is-active-checkbox"
										class="ig-control__cbx"
										checked={form.active}
										onChange={handleForm.checkbox('active')}
									/>
									<label for="is-active-checkbox">Is Event Active?</label>
								</div>
								<p class="help has-text-dark">Uncheck, if you want to temporary disable this event</p>
							</p>
						</div>
					)}
					<div class="field">
						{submitError && (
							<div class="control">
								<Animate
									component="div"
									enter="fadeIn"
									leave="fadeOutUp"
									change="fadeIn"
									durationEnter={600}
									durationChange={600}
									durationLeave={600}
								>
									<label class="label" style={{ color: 'red', fontSize: 14 }}>
										{submitError}
									</label>
								</Animate>
							</div>
						)}
						{hasErrors && form.iagree && (
							<div class="control">
								<label class="label" style={{ color: 'red', fontSize: 14 }}>
									<Animate
										enter="pulse"
										leave="fadeOutUp"
										change="pulse"
										durationEnter={800}
										durationChange={800}
										durationLeave={800}
									>
										<div style={{ display: 'inline-block' }}>Please fix found errors</div>
									</Animate>
								</label>

								<Animate
									component="div"
									enter="fadeIn"
									leave="fadeOutUp"
									change="fadeIn"
									durationEnter={800}
									durationChange={800}
									durationLeave={800}
								>
									{Object.keys(errors).map(item => (
										<p class="help is-danger" key={item}>
											{errors[item]}{' '}
										</p>
									))}
								</Animate>
							</div>
						)}
					</div>
					<nav class="level m-t-10 m-b-0" style={{ flexFlow: isRemove && 'column wrap' }}>
						<div class={cn`${isView ? 'is-fullwidth' : 'level-left'}`}>
							<div class={cn`field m-b-10 ${isView && 'is-fullwidth'}`}>
								<p class="control" onClick={handleRegisterMouseClick}>
									<button
										class={addClass(
											{
												'is-loading': submiting && !hasErrors,
												'is-disabled': !form.iagree,
												'is-primary': addNew || isCopy || isEdit,
												'is-danger': isRemove,
												'is-fullwidth close-provider': isView
											},
											'button is-size1-5 all-caps on-light is-medium'
										)}
										onClick={handleRegistration}
									>
										<FormSubmitButton />
									</button>
								</p>
							</div>
							<div class="field m-b-10" style={{ paddingLeft: 10, marginBottom: '.75rem' }}>
								{!form.iagree && registerButtonClick && (
									<p class="help has-text-visible animated fadeInDown">
										<label
											style={{
												fontFamily: 'Ubuntu Condensed',
												fontSize: '110%'
											}}
										>
											You must click `I Agree` <br /> to the Terms and Conditions{' '}
										</label>
									</p>
								)}
							</div>
						</div>
						<div class={cn`${isRemove && 'has-text-centered'}`}>
							{clearForm ? (
								<span class="has-text-dark">
									You Sure?{' '}
									<a
										href="/#"
										class="button has-text-white is-small is-danger"
										onClick={handleCancelForm}
										style={{ color: '#fff' }}
									>
										YES CANCEL {(addNew || isCopy) && 'REGISRTION'}
									</a>{' '}
									-{' '}
									<a href="/#" class="button is-small" onClick={handleCancelCancelForm}>
										NO
									</a>
								</span>
							) : (
								(!isView || isRemove) && (
									<button class="button is-link is-md" onClick={handleCancelForm}>
										Cancel
									</button>
								)
							)}
						</div>
					</nav>
					<EventNotActive className="m-b-0" />
					{updateCurrentEventNotification && (
						<Notification type="is-warning is-permanent p-t-15" showClose={false}>
							<p>
								<b>
									Event's information update detected{' '}
									<button onClick={handleEventInfoUpdate} class="m-l-md is-info button is-small all-caps">
										Update Event
									</button>
								</b>
							</p>
						</Notification>
					)}
				</div>
			</div>
		);
	}
}

export default NewEventForm;
