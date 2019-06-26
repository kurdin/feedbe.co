/* globals */
import React, { Component } from 'react';
import addClass from 'classnames';
import Animate from 'animate.css-react';
import { format as timeago } from 'timeago.js';
import flatAsync from 'flatasync';
import { Link } from 'react-router-dom';
import isEqual from 'lodash/isEqual';

import { cn, shallowCompare, scrollTo } from 'shared/utils';
import Notification from 'components/Notification';

import FormSchema from './user-form-schema';
import emailMask from 'text-mask-addons/dist/emailMask';
import { newUserFormOptions } from 'shared/config/defaults';

import { InputField } from '../Form';

import API from '../../APIs';
import 'shared/inferno-select/src/example.css';

class NewUserForm extends Component {
	static displayName = 'New User Form';

	constructor(props) {
		super(props);
		this.defaults = {
			form: { ...JSON.parse(JSON.stringify(newUserFormOptions)), ...props.form },
			clearForm: false,
			submiting: false,
			registerButtonClick: false,
			errors: {}
		};

		let provider = {};

		if (props.form && props.form.$loki) {
			const providerInfo = props.providers.find(p => p.userId === props.form.$loki);

			provider = providerInfo
				? {
						name: providerInfo.name,
						id: providerInfo.$loki
				  }
				: null;
		}

		this.state = {
			provider,
			...this.defaults
		};
		this.getUserData();
	}

	async getUserData() {
		const { $loki: uid = null } = this.state.form;
		if (!uid) return;
		let [err, result] = await flatAsync(API.getUser({ uid }));
		if (!err && result) {
			if (!isEqual(result, this.state.form)) {
				this.setState({
					updateCurrentUserNotification: true,
					updatedUserData: result
				});
			}
		}
	}

	componentWillReceiveProps(newProps) {
		if (newProps.isEdit !== this.props.isEdit) this.getUserData();
		if (this.state.updateCurrentUserNotification) {
			this.setState(
				{
					updateCurrentUserNotification: false,
					form: newProps.form
				},
				() => {
					scrollTo(this.newForm, 300);
				}
			);
		}
	}

	handleUserInfoUpdate = () => {
		this.props.onDataUpdate(this.state.updatedUserData);
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

	handleTypeChange = e => {
		if (this.props.isView) return false;
		const value = e.target.value || (e.target.control && e.target.control.value);
		const isProvider = value === 'provider' ? true : false;
		if (isProvider !== this.state.form.isProvider) {
			this.setState({
				form: {
					...this.state.form,
					isProvider
				}
			});
		}
	};

	handleTypeChange2 = e => {
		e.preventDefault();
		const isProvider = e.target.value === 'provider' ? true : false;
		if (isProvider !== this.state.form.isProvider) {
			this.setState({
				form: {
					...this.state.form,
					isProvider
				}
			});
		}
	};

	componentDidMount() {
		if (this.props.scrollToForm) scrollTo(this.newForm, 300);
	}

	handleRegisterMouseClick = () => {
		this.setState({ registerButtonClick: true });
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

	handleActivate = () => {
		const form = this.state.form;
		const email = this.props.email;
		const userId = this.props.data.id;

		const active = !form.active;

		this.setState({ submitingActivate: true }, async () => {
			let [err, result] = await flatAsync(API.activateUser({ active, uid: form.$loki, email, userId }));
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
		if (isRemove && !window.confirm('Are you sure you want to REMOVE this User?')) return;
		let hasErrors = this.handleCheckErrors(null)();
		if (!hasErrors) {
			this.setState({ submiting: true, submitError: null, changeUser: false });
			const form = this.state.form;
			const email = this.props.email;
			const userId = this.props.data.id;

			let err;
			let result;

			if (isEdit) {
				[err, result] = await flatAsync(API.updateUser({ email, form, userId }));
			} else if (isRemove) {
				[err, result] = await flatAsync(API.deleteUser({ email, userId, uid: form.$loki }));
			} else {
				[err, result] = await flatAsync(API.addUser({ email, form, userId }));
			}

			if (err) {
				this.setState({
					submiting: false,
					submitError:
						err.responseJSON && err.responseJSON.err ? err.responseJSON.err : 'Opps, Something Wrong! Please Try Again.'
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
			changeUser: !prevState.changeUser
		}));
	};

	handleProviderChangeValue = val => {
		const { value: id, label: name } = val;
		const { form } = this.state;
		if (form.provider && form.provider.id !== id) {
			if (!window.confirm('Are you sure you want to CHANGE Provider for this User?')) return;
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

	handleEdit = () => {
		// scrollTo('body', 0);
		scrollTo(this.newForm, 300);
		this.props.onEdit();
	};

	closeForm() {
		this.setState({
			...this.defaults,
			form: { ...newUserFormOptions }
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
				{isRemove && 'Removing'} User {isCopy && 'Copy From'}
				{addNew
					? 'Form'
					: form && (
							<div>
								UID: <b>{form.$loki}</b> added: <b>{timeago(form.created)}</b>
							</div>
					  )}
			</h3>
		) : (
			<h3 class={'title is-3 m-0 has-text-centered'}>
				Viewing User UID: <b>{form.$loki}</b>
				<div>
					added: <b>{timeago(form.created)}</b>
				</div>
				<button onClick={this.handleEdit} class="button m-t-10 is-info is-small all-caps m-b-0">
					Edit User
				</button>{' '}
				{form.active ? (
					<button
						onClick={this.handleActivate}
						class={cn`button m-t-10 is-small is-danger all-caps m-b-0 ${submitingActivate && 'is-loading'}`}
					>
						Deactivate
					</button>
				) : (
					<button
						onClick={this.handleActivate}
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

	NotActive = ({ className }) => {
		return (
			!this.state.form.active && (
				<article class={cn`message is-danger m-b-10 ${className && className} `}>
					<div class="message-header flex-aligned-center">
						<p>
							<b>USER IS NOT ACTIVE</b>
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
				{isRemove && 'Remove This'} User {isCopy && 'From Copy'}
				{isEdit && 'Registration'}
			</span>
		) : (
			<span> Close User View </span>
		);
	};

	render() {
		const { addNew, isEdit, isCopy, isRemove, isAdmin } = this.props;
		let { isView } = this.props;
		const { errors, clearForm, form, provider, submiting, submitError, updateCurrentUserNotification } = this.state;
		const {
			handleForm,
			handleRegistration,
			handleRegisterMouseClick,
			handleCancelForm,
			handleCancelCancelForm,
			handleCheckErrors,
			FormHeader,
			FormSubmitButton,
			NotActive,
			handleUserInfoUpdate
		} = this;

		let hasErrors = Object.keys(errors).some(item => errors[item] !== null);

		if (isView && !form.$loki) return <div>No User Found, Try Again</div>;
		if (isRemove) isView = true;

		return (
			<div class={`columns is-vcentered ${isView ? 'view-only' : ''}`} ref={ref => (this.newForm = ref)}>
				<div class="column is-8 is-offset-2 new-provider-form in-form">
					<NotActive />
					<FormHeader />
					<hr class="hr-text" data-content="User's Profile Type" />

					<div>
						<div class="field">
							<p class="control">
								<div class="switch-field d-flex flex-aligned-center">
									<input
										type="radio"
										onChange={this.handleTypeChange}
										disabled={isView}
										id="switch_left"
										name="switch_2"
										value="provider"
										checked={form.isProvider}
									/>
									<label
										for="switch_left"
										style={{ width: 120, opacity: isView && !form.isProvider ? 0.3 : 1 }}
										onClick={this.handleTypeChange}
									>
										Provider
									</label>
									<input
										type="radio"
										disabled={isView}
										onChange={this.handleTypeChange}
										id="switch_right"
										name="switch_2"
										value="parent"
										checked={!form.isProvider}
									/>
									<label
										for="switch_right"
										style={{ width: 120, opacity: isView && form.isProvider ? 0.3 : 1 }}
										onClick={this.handleTypeChange}
									>
										Parent
									</label>
								</div>
							</p>
							{!isView && (
								<p class="help has-text-dark has-text-centered m-t-10">
									Select <u>Provider</u> if user provides parents night out events or select <u>Parent</u> if user just
									looking for events.
								</p>
							)}
						</div>
					</div>
					<div class="field m-t-10">
						{form.isProvider && provider && provider.name && (
							<div>
								<label class="label m-0">Provider Name </label>
								<p class="control is-expanded">
									<input class="input has-text-black" disabled={true} type="text" value={provider.name} />
								</p>
								{isAdmin && (
									<p class="control">
										<span>
											<Link to={`/providers/${provider.id}`} target="_blank">
												Provider ID: {provider.id}
												<span class="icon pointer" title="View provider information in new tab">
													&#0064;
												</span>
											</Link>
										</span>
									</p>
								)}
							</div>
						)}
					</div>
					<hr class="hr-text" data-content="Required User's Information" />
					<InputField label="User Name" name="name" {...{ errors, form, isView, handleForm, handleCheckErrors }} />
					<InputField
						label="Email Address"
						placeholder="name@domain.com"
						name="email"
						mask={emailMask}
						{...{ errors, form, handleForm, handleCheckErrors, isView }}
					/>
					<hr class="hr-text" data-content="Event's Additional Information" />

					<InputField
						label="Phone Number"
						name="phone"
						helpText="Make sure you enter correct phone."
						placeholder="(___) ___-____"
						mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
						{...{ errors, form, handleForm, handleCheckErrors, isView }}
					/>

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
									<label for="is-active-checkbox">Is User Active?</label>
								</div>
								<p class="help has-text-dark">Uncheck, if you want to temporary disable this user</p>
							</p>
						</div>
					)}
					<div class="field m-t-10">
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
						{hasErrors && (
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
					<NotActive className="m-b-0" />
					{updateCurrentUserNotification && (
						<Notification type="is-warning is-permanent p-t-15" showClose={false}>
							<p>
								<b>
									User's information update detected{' '}
									<button onClick={handleUserInfoUpdate} class="m-l-md is-info button is-small all-caps">
										Update User
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

export default NewUserForm;
