import React, { Component } from 'react';
import flatAsync from 'flatasync';
import moment from 'moment';
import timeago from 'timeago.js';
import { SingleSwitch } from '../Form';
import ProviderForm from './ProviderForm';
import Notification from '../Notification';

import API from '../../APIs';

class ProviderCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			doDelete: false,
			isProviderActive: props.provider.active
		};
	}

	handleDeleteCancel = e => {
		e.preventDefault();
		this.setState({
			doDelete: false
		});
	};

	handleAfterEditOrView = provider => {
		if (!provider) {
			this.setState({
				isEdit: false,
				isView: false
			});
			return;
		}

		this.setState(
			{
				isEdit: false,
				success: 'Provider Updated',
				isProviderActive: provider.active
			},
			this.hideNotification('success')
		);
		this.props.onAfterEdit(provider);
	};

	showGeneralError() {
		if (this.state.error) return;
		this.setState(
			{
				error: true
			},
			this.hideNotification('error')
		);
	}

	hideNotification(type) {
		setTimeout(() => {
			this.setState({ [type]: false });
		}, 5000);
	}

	handleActiveProviderSwitch = async val => {
		const {
			provider: { $loki },
			email
		} = this.props;
		const [err, result] = await flatAsync(API.activateProvider({ email, providerId: $loki, active: val }));

		if (err || !result) return this.showGeneralError();

		this.setState(
			{
				error: false,
				success: `Provider's Active Status Changed`,
				isProviderActive: result.active
			},
			this.hideNotification('success')
		);
	};

	handleEditProvider = () => {
		this.setState({
			isView: false,
			isEdit: true
		});
	};

	handleViewProvider = () => {
		this.setState({
			isEdit: false,
			isView: true
		});
	};

	handleProviderDelete = async e => {
		e.preventDefault();
		if (!this.state.doDelete) {
			return this.setState({
				doDelete: true
			});
		}
		if (!window.confirm('We about to DELETE your provider?')) return;

		const {
			provider: { $loki },
			email
		} = this.props;
		const [err, result] = await flatAsync(API.deleteProvider({ email, providerId: $loki }));

		if (err) {
			this.setState({
				doDelete: false,
				error: true
			});
			return;
		}

		if (result) {
			this.setState(
				{
					doDelete: false,
					success: 'Provider Deleted'
				},
				this.hideNotification('success')
			);
			this.props.onDelete(null);
		}
	};

	render({ provider, onAfterEdit, email: userEmail, data }) {
		const { name, description, email, created, address, phone, zip } = provider;
		const { doDelete, isProviderActive, error, success, isEdit, isView } = this.state;
		const {
			handleProviderDelete,
			handleEditProvider,
			handleDeleteCancel,
			handleActiveProviderSwitch,
			handleAfterEditOrView,
			handleViewProvider
		} = this;

		if (isEdit || isView)
			return (
				<ProviderForm
					form={provider}
					isView={isView}
					isEdit={isEdit}
					scrollToForm={true}
					onEdit={handleEditProvider}
					onSubmit={handleAfterEditOrView}
					email={userEmail}
					{...{ data }}
				/>
			);

		return (
			<div>
				{error && (
					<Notification type="is-danger" onClose={() => this.setState({ error: false })}>
						<p>
							<b>Error!</b> Something wrong, please try again.
						</p>
					</Notification>
				)}
				{success && (
					<Notification onClose={() => this.setState({ success: null })}>
						<p>
							<b>Success!</b> {success}.
						</p>
					</Notification>
				)}
				<div class={`card ${!isProviderActive ? 'provider-not-active' : ''}`}>
					<header class="card-header">
						<p class="card-header-title" style={{ flexGrow: 5 }}>
							Provider created {timeago.format(created)} on {moment.utc(new Date(created)).format('lll')}
						</p>
						<p class="card-footer-item" style={{ flexGrow: 5, justifyContent: 'flex-end' }}>
							{doDelete ? (
								<span class="has-text-dark">
									Sure?{' '}
									<a
										href="/#"
										class="button has-text-white is-small is-danger"
										onClick={handleProviderDelete}
										style={{ color: '#fff' }}
									>
										YES, DELETE
									</a>{' '}
									or{' '}
									<a href="/#" class="button is-small" onClick={handleDeleteCancel}>
										CANCEL
									</a>
								</span>
							) : (
								<a href="/#" class="delete-item button is-link is-small" onClick={handleProviderDelete}>
									DELETE
								</a>
							)}
						</p>
					</header>
					<div class="not-active-message">
						<p>Provider NOT Active</p>
					</div>
					<div class="card-content">
						<div class="media">
							{/*<div class="media-left">
							<figure class="image is-48x48">
								<img src="https://bulma.io/images/placeholders/96x96.png" alt="Placeholder" />
							</figure>
						</div>*/}
							<div class="media-content has-text-dark">
								<p class="title is-3">{name}</p>
								<p class="subtitle is-7">{address}</p>
							</div>
						</div>

						<div class="content">
							<p>{description}</p>
							<p>
								zip: <b>{zip}</b> <br />
								phone: <b>{phone}</b>
								<br />
								email: <b>{email ? email : 'not provided'}</b>
								<br />
							</p>
						</div>
						<div>
							<button href="/#" onClick={handleViewProvider} class="button">
								View Full Provider's Information
							</button>
						</div>
					</div>
					<footer class="card-footer">
						<a href="/#" class="card-footer-item add-new-event" onClick={this.props.onNewEvent}>
							<span class="icon">&#0058;</span> ADD NEW EVENT
						</a>
						<span class="card-footer-item" style={{ flexGrow: 2 }}>
							<SingleSwitch
								label="Is Provider Active?"
								value={isProviderActive}
								onChange={handleActiveProviderSwitch}
								labelOff="No"
								labelOn="Yes"
							/>
						</span>
						<span class="card-footer-item" style={{ justifyContent: 'flex-end' }}>
							<button class="button is-small" onClick={handleEditProvider}>
								EDIT PROVIDER
							</button>
						</span>
					</footer>
				</div>
			</div>
		);
	}

	// methods
}

export default ProviderCard;
