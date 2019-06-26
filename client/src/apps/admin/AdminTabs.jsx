import { Link } from 'react-router-dom';

const AdminTabs = ({ selected, link, store: { events, providers, users } }) => (
	<div class="tabs is-centered is-medium">
		<ul>
			<li class={selected === 'Overview' ? 'is-active' : ''}>
				<Link to="/">Overview</Link>
			</li>
			<li class={selected === 'Events' ? 'is-active' : ''}>
				<Link to="/events">Events ({events.length})</Link>
			</li>
			<li class={selected === 'Providers' ? 'is-active' : ''}>
				<Link to="/providers">Providers ({providers.length}) </Link>
			</li>
			<li class={selected === 'Users' ? 'is-active' : ''}>
				<Link to="/users">Users ({users.length})</Link>
			</li>
		</ul>
	</div>
);

export default AdminTabs;
