/* globals $ */
import { Component } from 'react';

import NewProvider from 'components/Providers/NewProvider';
import ProviderCard from 'components/Providers/ProviderCard';
import Notification from 'components/Notification';
import { ThemeProvider } from '@zendeskgarden/react-theming';

import { Tabs, TabPanel } from '@zendeskgarden/react-tabs';
import { css } from 'styled-components';

import { Badges } from './Badgers';

import 'shared/styles/react-tabs-styles.css';

const theme = {
	'tabs.tab': css`
		&& {
			margin-bottom: 15px;
			font-size: 18px;
		}
		&&:hover {
			color: #00d1b2;
			opacity: 1;
		}
		${props => {
			if (props.selected || props.active || props.focused) {
				return '&& { color: #00d1b2; opacity: 1; font-weight: 900;}';
			} else {
				return '&& { color: #fff; opacity: 0.4;}';
			}
		}};
	`,
	'tabs.tab_list': css`
		&& {
			width: 120px;
		}
	`,
	'tabs.tabs': css`
		&& {
			width: 100%;
		}
	`
};

export class Account extends Component {
	static displayName = 'Account';

	constructor(props) {
		super(props);
		this.state = {
			activeTab: props.activeTab || 'my-websites',
			isProvider: props.data.isProvider,
			userProvider: props.userProviders && props.userProviders[0],
			name: props.name
		};
	}

	handleChangeActiveTab = tab => {
		console.log('tab', tab);
		this.setState({ activeTab: tab }, () => {
			this.props.history.push('/' + tab);
		});
	};

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
		const { name, changeName, changeType, userProvider, isProvider, newProviderAdded, activeTab } = this.state;
		const { email, data, isAdmin } = this.props;
		const { handleAferFormSubmit, handleAferEditSubmit, handleChangeActiveTab } = this;

		return (
			<div class="section-transparent animated fadeIn">
				<div class="columns is-vcentered">
					<div class="column is-12">
						<ThemeProvider theme={theme}>
							<Tabs vertical selectedKey={activeTab} onChange={handleChangeActiveTab}>
								<TabPanel
									className="tabs-account-panel"
									label={<span class="tabs-account">My Websites</span>}
									key="my-websites"
								>
									<h3>My Websites and Roles</h3>
									My Websites goes here
									<Badges />
								</TabPanel>
								<TabPanel
									className="tabs-account-panel"
									label={<span class="tabs-account">Profile</span>}
									key="profile"
								>
									<h3>Profile Information</h3>
									Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum
									amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna
								</TabPanel>
								<TabPanel
									className="tabs-account-panel"
									label={<span class="tabs-account">Account</span>}
									key="settings"
								>
									<h3>Account Settings</h3>
									<div class="content account-settings">
										<h4 class="title tabs-section-header">Change password</h4>

										<div class="field is-horizontal">
											<div class="field-label is-normal">
												<label class="label">Current password</label>
											</div>
											<div class="field-body">
												<div class="field">
													<div class="control is-half">
														<input class="input" type="password" required />
													</div>
												</div>
											</div>
										</div>

										<div class="field is-horizontal">
											<div class="field-label is-normal">
												<label class="label">New password</label>
											</div>
											<div class="field-body">
												<div class="field">
													<div class="control is-half">
														<input class="input" type="password" name="new-password" required />
													</div>
												</div>
											</div>
										</div>

										<div class="field is-horizontal">
											<div class="field-label is-normal">
												<label class="label">Confirm new password</label>
											</div>
											<div class="field-body">
												<div class="field">
													<div class="control is-half">
														<input class="input" type="password" name="confirm-new-password" required />
													</div>
												</div>
											</div>
										</div>

										<div class="field is-horizontal">
											<div class="field-label" />
											<div class="field-body">
												<div class="field">
													<div class="control">
														<button class="button is-light">Upadate Password</button>
														<button class="button is-link">Forgot password?</button>
													</div>
												</div>
											</div>
										</div>
									</div>
								</TabPanel>
								<TabPanel
									className="tabs-account-panel"
									label={<span class="tabs-account">Advanced</span>}
									key="advanced"
								>
									<h3>Advanced Options</h3>
									Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum
									dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit
									praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit
									amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna
									aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit
									lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in
									vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et
									accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te
									feugait nulla facilisi. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie
									consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio
									dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.
									Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut
									laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
									ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor
									in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis
									at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue
									duis dolore te feugait nulla facilisi.
								</TabPanel>
							</Tabs>
						</ThemeProvider>
						<br />
						<h3 class="title is-5 has-text-centered" hidden>
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
												Select Account Type:{' '}
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
										<p style={{ marginTop: '5px' }}>
											{' '}
											Account Type:{' '}
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
