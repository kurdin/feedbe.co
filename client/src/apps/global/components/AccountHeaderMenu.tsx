import React, { Component } from 'react';
import { LogOut, User, Settings, Heart } from 'react-feather';
import OutsideClickHandler from 'shared/OutsideClickHandler';
import Tooltip from 'shared/tooltip';
// import Tooltip from '@client/shared/tooltip';

export type AccountHeaderMenuProps = {
	userName: string;
	userEmail: string;
};

export type AccountHeaderMenuState = {
	isActive: boolean;
};

export class AccountHeaderMenu extends Component<AccountHeaderMenuProps, AccountHeaderMenuState> {
	readonly state = {
		isActive: false
	};

	handleAccountMenuClick = e => {
		e.preventDefault();
		e.stopPropagation();
		this.setState(prevState => ({
			isActive: !prevState.isActive
		}));
	};

	handleOutSideAccountMenuClick = e => {
		if (!this.state.isActive) {
			return;
		}
		this.setState({
			isActive: false
		});
	};

	render() {
		const { userName, userEmail } = this.props;
		const { isActive } = this.state;
		const { handleAccountMenuClick, handleOutSideAccountMenuClick } = this;

		return (
			<>
				<a
					className="login logged"
					onClick={handleAccountMenuClick}
					aria-haspopup="true"
					aria-controls="account-header-menu"
					aria-label="email address here"
				>
					<span className="loginIcon">
						<Tooltip
							hideArrow={false}
							modifiers={{
								offset: {
									offset: '20, 15'
								}
							}}
							delayShow={1200}
							tooltipShown={userEmail == null || isActive ? false : undefined}
							placement="bottom-end"
							trigger="hover"
							tooltip={userEmail}
						>
							<User size={14} className="menu-icons ignore-onclickoutside-account-menu" />
						</Tooltip>
					</span>
					<span className="loginName ignore-onclickoutside-account-menu">{userName}</span>
					<span className="icon-angle-down ignore-onclickoutside-account-menu" />
				</a>
				<div class={`dropdown is-right ${isActive ? 'is-active' : ''}`}>
					<OutsideClickHandler
						component="div"
						className="wrapOutSide"
						onOutsideClick={handleOutSideAccountMenuClick}
						ignoreClass="ignore-onclickoutside-account-menu"
					>
						<div class="dropdown-menu" id="account-header-menu" role="menu">
							<div class="dropdown-content">
								<a href="/account/my-websites" class="dropdown-item">
									<Heart size={14} class="menu-icons" />
									<span>My Websites</span>
								</a>
								<a href="/account/profile" class="dropdown-item">
									<User size={14} class="menu-icons" />
									<span>Profile</span>
								</a>
								<a href="/account/settings" class="dropdown-item">
									<Settings size={14} class="menu-icons" />
									<span>Account Settings</span>
								</a>
								<hr class="dropdown-divider" />
								<a href="/logout" class="dropdown-item">
									<span>Log Out</span>
									<LogOut size={14} class="log-out" />
								</a>
							</div>
						</div>
					</OutsideClickHandler>
				</div>
			</>
		);
	}
}
