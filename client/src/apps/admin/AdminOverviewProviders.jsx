import { Link } from 'react-router-dom';

import addClass from 'classnames';
import { Tooltip } from 'shared/inferno-tippy/src/';
import moment from 'moment';
import { format } from 'timeago.js';

import 'shared/inferno-tippy/src/tippy.css';
import { JSXFilters } from 'shared/filters';

const filter = new JSXFilters();

const AdminOverviewProviders = ({ providers, itemsCount = 20 }) => {
	return (
		<div>
			<h4 class="title is-4">
				Last 20{' '}
				<Link to="/events">
					<u>Providers</u> ({providers.length})
				</Link>
			</h4>

			{providers.length > 0 ? (
				<div>
					<table class="table">
						<thead>
							<tr>
								<th class="is-narrow">pid</th>
								<th>Provider Name</th>
								<th class="is-narrow">Zip</th>
								<th>Address</th>
								<th>Phone</th>
								<th class="is-narrow">
									<span class="is-narrow hint--timeout hint--top" aria-label={'User Id'}>
										uid
									</span>
								</th>
								<th>Created</th>
							</tr>
						</thead>
						<tbody>
							{providers
								.slice(providers.length - itemsCount, providers.length)
								.reverse()
								.map(provider => (
									<tr
										key={provider.$loki}
										class={addClass(
											{
												disabled: provider.active === false
											},
											'row'
										)}
									>
										<td class="is-narrow is-id">
											<Link to={`/providers/${provider.$loki}`}>{provider.$loki}</Link>
										</td>
										<td>
											<Link to={`/providers/${provider.$loki}`}>{provider.name}</Link>
											{provider.about && (
												<Tooltip
													html={<div style={{ fontSize: '1rem', textAlign: 'left' }}>{provider.about}</div>}
													trigger="click"
													interactive={false}
													position="right"
													arrow="true"
													theme="light"
												>
													<span class="icon pointer about-description-icon" title="About Provider">
														&#0081;
													</span>
												</Tooltip>
											)}
										</td>
										<td class="is-narrow">{provider.zip}</td>
										<td>{filter.str(provider.address).cut(20).val}</td>
										<td>{provider.phone}</td>
										<td>{provider.userId}</td>
										<td>
											<span
												class="hint--timeout hint--bottom"
												aria-label={moment.utc(new Date(provider.created)).format('lll')}
											>
												{format(provider.created)}
											</span>
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			) : (
				<p class="has-text-centered">
					<b>No Providers</b>
				</p>
			)}
		</div>
	);
};

export default AdminOverviewProviders;
