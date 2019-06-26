import addClass from 'classnames';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { format } from 'timeago.js';

import 'shared/inferno-tippy/src/tippy.css';

const AdminOverviewUsers = ({ users, itemsCount = 20 }) => {
	return (
		<div>
			<h4 class="title is-4">
				Last 20{' '}
				<Link to="/users">
					<u>Users</u> ({users.length})
				</Link>
			</h4>
			{users.length > 0 ? (
				<div>
					<table class="table">
						<thead>
							<tr>
								<th class="is-narrow">uid</th>
								<th>User Name</th>
								<th>Email</th>
								<th>Provider</th>
								<th>Created</th>
								<th>Last Login</th>
							</tr>
						</thead>
						<tbody>
							{users.slice(0, itemsCount).map(user => (
								<tr
									key={user.$loki}
									class={addClass(
										{
											disabled: user.active === false
										},
										'row'
									)}
								>
									<td class="is-narrow is-id">
										<Link to={`/users/${user.$loki}`}>{user.$loki}</Link>
									</td>
									<td>
										<Link to={`/users/${user.$loki}`}>{user.name}</Link>
									</td>
									<td>
										<a href={`mailto:${user.email}`}>{user.email}</a>
									</td>
									<td>
										{user.isProvider ? (
											<Link to={`/providers/${user.isProvider}`} target="_blank">
												yes
											</Link>
										) : (
											'no'
										)}
									</td>
									<td>
										<span
											class="hint--timeout hint--bottom"
											aria-label={moment.utc(new Date(user.created)).format('lll')}
										>
											{format(user.created)}
										</span>
									</td>
									<td>
										<span
											class="hint--timeout hint--bottom"
											aria-label={moment.utc(new Date(user.lastLogin)).format('lll')}
										>
											{format(user.lastLogin)}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p class="has-text-centered">
					<b>No Users Found</b>
				</p>
			)}
		</div>
	);
};

export default AdminOverviewUsers;
