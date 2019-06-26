import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import AdminTabs from './AdminTabs';
import 'shared/inferno-tippy/src/tippy.css';

import Events from './AdminOverviewEvents';
import Providers from './AdminOverviewProviders';
import Users from './AdminOverviewUsers';

class AdminOverview extends Component {
	static displayName = 'Admin Overview2';

	constructor(props) {
		super(props);
		this.providers = props.store.providers;
		this.users = props.store.users;
		this.events = props.store.events;
	}

	render() {
		const {
			store,
			store: { providers, users, events }
		} = this.props;
		return (
			<section class="clear">
				<AdminTabs selected={'Overview'} {...{ store }} />
				<nav class="level">
					<div class="level-left">
						<div class="level-item">
							<div class="field has-addons">
								<p class="control" />
							</div>
						</div>
						<div class="level-item">
							<p class="subtitle is-medium has-text-left fixed-100" />
						</div>
					</div>
					<div class="level-right">
						<p class="level-item">
							<Link to="/events/new" className="add-new button is-medium is-primary">
								<span>
									<span class="icon">&#192;</span>
									<b>ADD EVENT</b>
								</span>
							</Link>
						</p>
						<p class="level-item">
							<Link to="/providers/new" className="add-new button is-medium is-primary">
								<span>
									<span class="icon">&#192;</span>
									<b>ADD PROVIDER</b>
								</span>
							</Link>
						</p>
						<p class="level-item">
							<Link to="/users/new" className="add-new button is-medium is-primary">
								<span>
									<span class="icon">&#192;</span>
									<b>ADD USER</b>
								</span>
							</Link>
						</p>
					</div>
				</nav>

				<Events {...{ events }} />
				<Providers {...{ providers }} />
				<Users {...{ users }} />
			</section>
		);
	}
}

export default AdminOverview;
