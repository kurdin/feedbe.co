/* globals $ */
import { Component } from 'react';

import NewProvider from 'components/Providers/NewProvider';
import ProviderCard from 'components/Providers/ProviderCard';
import Notification from 'components/Notification';

class Profile extends Component {
	static displayName = 'Profile';

	constructor(props) {
		super(props);
		this.state = {
			isProvider: props.data.isProvider,
			userProvider: props.userProviders && props.userProviders[0],
			name: props.name
		};
	}

	handleChangeName = () => {
		this.setState({ changeName: true, changeType: false });
	};

	handleChangeType = () => {
		this.setState({ changeType: true });
	};

	handleKeyPress = e => {
		if (e.keyCode === 13 || e.charCode === 13) {
			e.preventDefault();
			e.stopPropagation();
			this.handleNameSubmit(e);
		}
	};

	handleNameInput = e => {
		this.setState({ name: e.currentTarget.value });
	};

	handleTypeLabelClick = e => {
		const isProvider = e.target.control.value === 'provider' ? true : false;
		if (isProvider === this.state.isProvider) this.setState({ changeType: false });
	};

	handleTypeChange = e => {
		e.preventDefault();
		const isProvider = e.target.value === 'provider' ? true : false;
		if (isProvider === this.state.isProvider) this.setState({ changeType: false });
		const email = this.props.email;
		const csrfToken = window.datashared && window.datashared.csrfToken;
		this.setState({ isProvider });
		$.ajax({
			url: '/user/change/type',
			dataType: 'json',
			contentType: 'application/json; charset=utf-8',
			type: 'PUT',
			data: JSON.stringify({ isProvider, email, _csrf: csrfToken }),
			success: data => {
				setTimeout(() => {
					this.setState({ changeType: false }, () => window.location.reload(true));
				}, 300);
			},
			error: (xhr, status, err) => {
				console.error(status, err.toString());
				window.location.reload(true);
			}
		});
	};

	handleAferFormSubmit = provider => {
		if (provider) {
			this.setState({
				userProvider: provider,
				newProviderAdded: true
			});
		} else {
			this.setState({
				userProvider: null,
				newProviderAdded: false
			});
		}
	};

	handleAferEditSubmit = provider => {
		if (provider) {
			this.setState({
				userProvider: provider
			});
		}
	};

	handleNameSubmit = e => {
		e.preventDefault();
		let name = this.state.name.trim();
		if (name === '') return false;
		if (name === this.props.name) return this.setState({ changeName: false });
		let email = this.props.email;
		let csrfToken = window.datashared && window.datashared.csrfToken;
		$.ajax({
			url: '/user/change/name',
			dataType: 'json',
			contentType: 'application/json; charset=utf-8',
			type: 'PUT',
			data: JSON.stringify({ name, email, _csrf: csrfToken }),
			success: data => {
				window.location.reload(true);
			},
			error: (xhr, status, err) => {
				console.error(status, err.toString());
				window.location.reload(true);
			}
		});
	};

	render() {
		const { name, changeName, changeType, userProvider, isProvider, newProviderAdded } = this.state;
		const { email, data, isAdmin } = this.props;
		const { handleAferFormSubmit, handleAferEditSubmit } = this;

		return (
			<div class="section-transparent">
				<div class="columns is-vcentered">
					<div class="column is-12">
						<h3 class="title is-5 has-text-centered">
							{changeName ? (
								<div class="field is-grouped is-grouped-centered">
									<p class="control-label" style={{ padding: '7px 7px' }}>
										Your Name
									</p>
									<p class="control">
										<input
											value={name}
											class="input"
											onInput={this.handleNameInput}
											placeholder="Enter Your Name"
											type="text"
											onKeyDown={this.handleKeyPress}
											autoFocus
											style={{ width: '150px' }}
										/>
									</p>
									<p class="control">
										<button class="button is-info" onClick={this.handleNameSubmit}>
											Save
										</button>
									</p>
								</div>
							) : (
								<p>
									{' '}
									Your Name: <b class="has-text-primary">{name}</b>{' '}
									<button class="button is-small is-outlined is-black is-inverted" onClick={this.handleChangeName}>
										change
									</button>
								</p>
							)}
						</h3>
					</div>
				</div>
				<div class="columns is-vcentered">
					{isAdmin ? (
						<div class="column is-12">
							<h3 class="title is-5 has-text-centered">
								<p>
									You have Admin privileges
									<br />
								</p>
								<a href="/admin" class="button has-text-dark is-size1-5 m-t-10 all-caps is-primary is-medium">
									Admin Dashboard
								</a>
								<p class="help m-t-10">Visit admin dashboard to manage providers, events and users</p>
							</h3>
						</div>
					) : (
						<div class={`column is-12 ${isProvider === null ? 'animated flash notification is-green' : ''}`}>
							<div class="title is-5 has-text-centered">
								{changeType || isProvider === null ? (
									<div>
										<div class="field is-grouped is-grouped-centered">
											<p class="control-label" style={{ padding: '4px 7px' }}>
												Select Profile Type:{' '}
											</p>
											<p class="control-label">
												<div class="switch-field">
													<input
														type="radio"
														onChange={this.handleTypeChange}
														id="switch_left"
														name="switch_2"
														value="provider"
														checked={isProvider}
													/>
													<label for="switch_left" style={{ width: '120px' }} onClick={this.handleTypeLabelClick}>
														Provider
													</label>
													<input
														type="radio"
														onChange={this.handleTypeChange}
														id="switch_right"
														name="switch_2"
														value="parent"
														checked={isProvider === false}
													/>
													<label for="switch_right" style={{ width: '120px' }} onClick={this.handleTypeLabelClick}>
														Parent
													</label>
												</div>
											</p>
										</div>
										<p class="has-text-centered" style={{ 'font-size': '16px' }}>
											Select <b class="has-text-primary">Provider</b> if you provide parents night out events or select{' '}
											<b class="has-text-primary">Parent</b> if you just looking for events in your area.
										</p>
									</div>
								) : (
									<div>
										<p style={{ 'margin-top': '5px' }}>
											{' '}
											Profile Type:{' '}
											{isProvider ? (
												<b class="has-text-primary">Provider</b>
											) : (
												<b class="has-text-primary">Parent</b>
											)}{' '}
											<button class="button is-small is-outlined is-black is-inverted" onClick={this.handleChangeType}>
												change
											</button>
										</p>
										{/*isProvider ? <p class="help2">Provider can create extended profile and add events parents can search </p> : <p class="help2">Parent can search providers' events and add them to favorites</p>*/}{' '}
									</div>
								)}
							</div>
						</div>
					)}
				</div>

				{newProviderAdded && (
					<Notification>
						<p>Success, providers form submited</p>
					</Notification>
				)}

				{isProvider && !isAdmin && (
					<div>
						{!userProvider ? (
							<NewProvider onSubmit={handleAferFormSubmit} {...{ email, name, data }} />
						) : (
							<ProviderCard
								onDelete={handleAferFormSubmit}
								onAfterEdit={handleAferEditSubmit}
								provider={userProvider}
								{...{ email, data }}
							/>
						)}
					</div>
				)}

				<div class="columns is-vcentered" style={{ marginTop: 55 }}>
					<div class="column is-12">
						<p class="title is-5 has-text-centered">Add to Favorites coming soon!</p>
					</div>
				</div>
			</div>
		);
	}
}

export default Profile;
