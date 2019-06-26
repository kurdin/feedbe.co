/* globals, confirm */
import React, { Component } from 'react';
import addClass from 'classnames';
import Animate from 'animate.css-react';
import { format as timeago } from 'timeago.js';
import { Link } from 'react-router-dom';
import flatAsync from 'flatasync';
import isEqual from 'lodash/isEqual';

import FormSchema from './provider-form-schema';
import emailMask from 'text-mask-addons/dist/emailMask';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import Notification from 'components/Notification';
import Select from 'shared/inferno-select/src/Select.js';

import {
	faciltyTypeOptions,
	activitiesOptions,
	languagesOptions,
	newProviderFormOptions
} from 'shared/config/defaults';

import { scrollTo, cn, shallowCompare } from 'shared/utils';
import { InputField, InputTextArea, SelectSinglePlusMinusField, InputCheckBox, InputSelectField } from '../Form';

import API from '../../APIs';

const numberMask = createNumberMask({
	prefix: '$',
	suffix: ''
});

class NewProvider extends Component {
	static displayName = 'Provider From';

	constructor(props) {
		super(props);
		this.defaults = {
			form: { ...newProviderFormOptions, ...props.form },
			clearForm: false,
			submiting: false,
			registerButtonClick: false,
			errors: {}
		};

		if (props.isAdmin) this.defaults.form.iagree = true;

		let user = {};

		if (props.form && props.form.userId) {
			const userInfo = props.users.find(p => p.$loki === props.form.userId);

			user = userInfo
				? {
						name: userInfo.name,
						id: userInfo.$loki
				  }
				: null;
		}

		this.state = { user, ...this.defaults };
		this.getProviderData();
	}

	async getProviderData() {
		const { $loki: providerId = null } = this.state.form;
		if (!providerId) return;
		let [err, result] = await flatAsync(API.getProvider({ providerId }));
		if (!err && result) {
			if (!isEqual(result, this.state.form)) {
				this.setState({
					updateCurrentProviderNotification: true,
					updatedProviderData: result
				});
			}
		}
	}

	componentWillReceiveProps(newProps) {
		if (newProps.isEdit !== this.props.isEdit) this.getProviderData();
		if (this.state.updateCurrentProviderNotification) {
			this.setState(
				{
					updateCurrentProviderNotification: false,
					form: newProps.form
				},
				() => {
					scrollTo(this.newForm, 300);
				}
			);
		}
	}

	handleProviderInfoUpdate = () => {
		this.props.onProviderDataUpdate(this.state.updatedProviderData);
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

	handleActivateProvider = () => {
		const form = this.state.form;
		const email = this.props.email;
		const userId = this.props.data.id;

		const active = !form.active;

		this.setState({ submitingActivate: true }, async () => {
			let [err, result] = await flatAsync(API.activateProvider({ active, providerId: form.$loki, email, userId }));
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
		if (isRemove && !window.confirm('Are you sure you want to REMOVE this provider?')) return;
		let hasErrors = this.handleCheckErrors(null)();
		if (!hasErrors) {
			this.setState({ submiting: true, submitError: null });
			const form = this.state.form;
			const email = this.props.email;
			const userId = this.props.data.id;

			let err;
			let result;

			if (isEdit) {
				[err, result] = await flatAsync(API.updateProvider({ email, form, userId }));
			} else if (isRemove) {
				[err, result] = await flatAsync(API.deleteProvider({ email, providerId: form.$loki }));
			} else {
				[err, result] = await flatAsync(API.addProvider({ email, form, userId }));
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
		}
	};

	handleCancelCancelForm = e => {
		e.preventDefault();
		this.setState({
			clearForm: false
		});
	};

	handleCancelForm = e => {
		e.preventDefault();
		if (!this.state.clearForm) {
			this.setState({
				clearForm: true
			});
		} else this.closeForm();
	};

	handleEditProvider = () => {
		// scrollTo('body', 0);
		scrollTo(this.newForm, 300);
		this.props.onEdit();
	};

	closeForm() {
		this.setState({
			...this.defaults,
			form: { ...newProviderFormOptions }
		});
		scrollTo('body', 0);
		this.props.onSubmit(null);
	}

	handleUserChange = () => {
		this.setState(prevState => ({
			changeUser: !prevState.changeUser
		}));
	};

	handleUserChangeValue = val => {
		const { value: id, label: name } = val;
		const { form } = this.state;
		if (form.userId !== id) {
			if (!window.confirm('Are you sure you want to CHANGE User for this Provider?')) return;
		}

		const user = {
			id,
			name
		};

		this.setState({
			form: {
				...form,
				userId: id
			},
			user,
			changeUser: false
		});
	};

	renderProviderUser = () => {
		const { user, changeUser } = this.state;
		const { isView, users } = this.props;
		const { handleUserChange, handleUserChangeValue } = this;

		const usersSelector = users.map(user => ({
			value: user.$loki,
			label: user.name
		}));

		return [
			<hr class="hr-text" data-content="Event's User Information" />,
			<div class="field">
				{user && user.name && !changeUser ? (
					<div>
						<div class="field has-addons">
							<p class="control">
								<span class={`${isView ? 'tag is-medium' : 'button'} is-info`}>
									User ID: {user.id}
									<Link to={`/users/${user.id}`} target="_blank">
										<span class="icon pointer m-0" title="View User Info in New Tab">
											&#0064;
										</span>
									</Link>
								</span>
							</p>
							<p class="control is-expanded">
								<input
									style={{ marginLeft: isView ? 10 : null }}
									class="input disabled has-text-black"
									disabled={true}
									type="text"
									value={user.name}
								/>
							</p>
							{!isView && (
								<p class="field">
									<button class="button is-correct" onClick={handleUserChange}>
										Change User
									</button>
								</p>
							)}
						</div>
					</div>
				) : (
					<div>
						<label class="label m-0">
							Select User for Provider <span class="check-done">&#245;</span>
						</label>
						<div class="field has-addons">
							<p class="control is-expanded m-0">
								<Select
									options={usersSelector}
									clearable={false}
									value={!changeUser && user && user.name}
									multi={false}
									autofocus={changeUser}
									onChange={handleUserChangeValue}
									searchable={true}
									required={false}
									placeholder={'Type Name'}
								/>
							</p>
							{changeUser && (
								<p class="field">
									<button class="button" onClick={handleUserChange}>
										Cancel
									</button>
								</p>
							)}
						</div>
					</div>
				)}
			</div>
		];
	};

	FormHeader = () => {
		let { addNew, isCopy, isEdit, isRemove, isView } = this.props;
		let { form, submitingActivate } = this.state;
		return !isView ? (
			<h3 class={`title is-3 m-0 has-text-centered ${isRemove ? 'is-danger' : isEdit || isCopy ? 'is-info' : ''}`}>
				{(addNew || isCopy) && 'New'}
				{isEdit && 'Edit'}
				{isRemove && 'Remove'} Provider Registration {isCopy && 'Copy From'}
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
				Viewing Provider ID: <b>{form.$loki}</b>
				<div>
					added: <b>{timeago(form.created)}</b>
				</div>
				<button onClick={this.handleEditProvider} class="button is-small m-t-10 is-info all-caps m-b-0">
					Edit Provider
				</button>{' '}
				{form.active ? (
					<button
						onClick={this.handleActivateProvider}
						class={cn`button m-t-10 is-small is-danger all-caps m-b-0 ${submitingActivate && 'is-loading'}`}
					>
						Deactivate
					</button>
				) : (
					<button
						onClick={this.handleActivateProvider}
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

	FormSubmitButton = () => {
		let { addNew, isCopy, isEdit, isRemove, isView } = this.props;
		return !isView ? (
			<span>
				{(addNew || isCopy) && 'Register New'}
				{isEdit && 'Update'}
				{isRemove && 'Remove This'} Provider {isCopy && 'From Copy'}
				{isEdit && 'Registration'}
			</span>
		) : (
			<span> Close View Provider</span>
		);
	};

	ProviderNotActive = ({ className }) => {
		return (
			!this.state.form.active && (
				<article class={cn`message is-danger m-b-10 ${className && className} `}>
					<div class="message-header flex-aligned-center">
						<p>
							<b>PROVIDER IS NOT ACTIVE</b>
						</p>
					</div>
				</article>
			)
		);
	};

	render() {
		const { addNew, isEdit, isCopy, isRemove, isView, isAdmin } = this.props;
		const {
			errors,
			clearForm,
			form,
			submiting,
			registerButtonClick,
			submitError,
			updateCurrentProviderNotification
		} = this.state;
		const {
			handleForm,
			handleRegistration,
			handleAgreeCheckbox,
			handleRegisterMouseClick,
			handleCancelForm,
			handleCancelCancelForm,
			handleCheckErrors,
			FormHeader,
			FormSubmitButton,
			ProviderNotActive,
			renderProviderUser,
			handleProviderInfoUpdate
		} = this;

		let hasErrors = Object.keys(errors).some(item => errors[item] !== null);

		return (
			<div class={`columns is-vcentered ${isView ? 'view-only' : ''}`} ref={ref => (this.newForm = ref)}>
				<div class="column is-two-thirds is-offset-2 new-provider-form in-form">
					<ProviderNotActive />
					<FormHeader />
					{isAdmin && renderProviderUser()}
					<hr class="hr-text" data-content="Required Provider's Information" />
					<InputField label="Name" name="name" {...{ errors, form, isView, handleForm, handleCheckErrors }} />

					<InputField label="Address" name="address" {...{ errors, form, handleForm, handleCheckErrors, isView }} />

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

					<hr class="hr-text" data-content="Additional Information" />

					<InputTextArea
						label="About Provider"
						placeholder="Enter Information About Provider"
						limit={2000}
						name="about"
						helpText="Tell parents more about your provider. Describe what you do and why parents need to choose you."
						{...{ errors, form, handleForm, handleCheckErrors, isView }}
					/>

					<InputField
						label="Facebook"
						placeholder="https://www.facebook.com/..."
						name="facebook"
						{...{ errors, form, handleForm, handleCheckErrors, isView }}
					/>

					<InputField
						label="Website or Webpage URL"
						placeholder="http://..."
						name="website"
						{...{ errors, form, handleForm, handleCheckErrors, isView }}
					/>

					<InputField
						label="Messenger Link"
						name="messenger"
						{...{ errors, form, handleForm, handleCheckErrors, isView }}
					/>

					<hr class="hr-text" data-content="Detailed Provider's Information" />

					<InputField
						label="Average Cost per Child"
						placeholder="$"
						name="cost"
						mask={numberMask}
						{...{ errors, form, handleForm, handleCheckErrors, isView }}
					/>

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
									By clicking `Register New Provider` button, you agree to the{' '}
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
									<label for="is-active-checkbox">Is Active Provider?</label>
								</div>
								<p class="help has-text-dark">Uncheck, if you want to temporary disable this provider</p>
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
										Please fix found errors
									</label>
								</Animate>
								{Object.keys(errors).map(item => (
									<p class="help is-danger" key={item}>
										{errors[item]}{' '}
									</p>
								))}
							</div>
						)}
					</div>
					<nav class="level m-t-10 m-b-0">
						<div class="level-left">
							<div class="field m-b-10">
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
										<label style={{ fontFamily: 'Ubuntu Condensed', fontSize: '110%' }}>
											You must click `I Agree` <br /> to the Terms and Conditions{' '}
										</label>
									</p>
								)}
							</div>
						</div>
						<div class="level-right">
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
									|{' '}
									<a href="/#" class="button is-small" onClick={handleCancelCancelForm}>
										NO
									</a>
								</span>
							) : (
								!isView && (
									<button class="button is-link" onClick={handleCancelForm}>
										Cancel
									</button>
								)
							)}
						</div>
					</nav>
					<ProviderNotActive className="m-b-0" />
					{updateCurrentProviderNotification && (
						<Notification type="is-warning is-permanent p-t-15" showClose={false}>
							<p>
								<b>
									Provider's information update detected{' '}
									<button onClick={handleProviderInfoUpdate} class="m-l-md is-info button is-small all-caps">
										Update Provider
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

export default NewProvider;
