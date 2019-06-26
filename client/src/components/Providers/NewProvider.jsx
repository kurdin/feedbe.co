import React, { Component } from 'react';
import ProviderForm from './ProviderForm';

class NewProvider extends Component {
	static displayName = 'New Provider';

	constructor(props) {
		super(props);
		this.state = {
			showNewForm: false
		};
	}

	handleShowNewForm = e => {
		this.setState({
			showNewForm: true
		});
	};

	onSubmit = provider => {
		if (provider) {
			this.props.onSubmit(provider);
		} else {
			this.setState({
				showNewForm: false
			});
		}
	};

	render({ name, email, data }) {
		const { showNewForm } = this.state;
		const { onSubmit } = this;

		return !showNewForm ? (
			<div class="columns is-vcentered">
				<div class="column is-12 has-text-centered">
					<button
						onClick={this.handleShowNewForm}
						class="button has-text-dark is-size1-5 all-caps is-primary is-medium"
					>
						Register Provider Profile
					</button>
					<p class="help" style={{ marginTop: 10 }}>
						Before you can add parents night out events you must register your provider profile
					</p>
				</div>
			</div>
		) : (
			<ProviderForm addNew={true} scrollToForm={true} {...{ name, email, data, onSubmit }} />
		);
	}
}

export default NewProvider;
