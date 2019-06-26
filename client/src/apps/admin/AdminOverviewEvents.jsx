import addClass from 'classnames';
import { Tooltip } from 'shared/inferno-tippy/src/';
import { Link } from 'react-router-dom';
import moment from 'moment';
import TimeAgo from 'shared/timeago';

import 'shared/inferno-tippy/src/tippy.css';

const AdminOverviewEvents = ({ events, itemsCount = 20 }) => {
	return (
		<div>
			<h4 class="title is-4">
				Last 20{' '}
				<Link to="/events">
					<u>Events</u> ({events.length})
				</Link>
			</h4>
			{events.length > 0 ? (
				<div>
					<table class="table">
						<thead>
							<tr>
								<th class="is-narrow">id</th>
								<th>Event Name</th>
								<th>Provider</th>
								<th class="is-narrow">Zip</th>
								<th>Next Date</th>
								<th>uid</th>
								<th>Created</th>
							</tr>
						</thead>
						<tbody>
							{events.slice(0, itemsCount).map(event => (
								<tr
									key={event.$loki}
									class={addClass(
										{
											disabled: event.active === false
										},
										'row'
									)}
								>
									<td class="is-narrow is-id">
										<Link to={`/events/${event.$loki}`}>{event.$loki}</Link>
									</td>
									<td>
										<Link to={`/events/${event.$loki}`}>{event.name}</Link>
										{event.description && (
											<Tooltip
												html={<div style={{ fontSize: '1rem', textAlign: 'left' }}>{event.description}</div>}
												trigger="click"
												interactive={false}
												position="right"
												arrow="true"
												theme="light"
											>
												<span class="icon pointer about-description-icon" title="Event Description">
													&#0081;
												</span>
											</Tooltip>
										)}
									</td>
									<td>
										{event.provider ? (
											<Link to={`/providers/${event.provider.id}`} target="_blank">
												{event.provider.name}
											</Link>
										) : (
											'Not Found'
										)}
									</td>
									<td class="is-narrow">{event.zip}</td>
									<td>
										{event.datesTimes
											.sort((a, b) => {
												a = new Date(a.date);
												b = new Date(b.date);
												return a > b ? -1 : a < b ? 1 : 0;
											})
											.map((d, i) => {
												return (
													i === 0 && (
														<span key={i}>
															{d.date} {event.datesTimes.length > 1 && <span>[+{event.datesTimes.length - 1}]</span>}
														</span>
													)
												);
											})}
									</td>
									<td>{event.userId}</td>
									<td>
										<span
											class="hint--timeout hint--bottom"
											aria-label={moment.utc(new Date(event.created)).format('lll')}
										>
											<TimeAgo datetime={event.created} />
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p class="has-text-centered">
					<b>No Events Found</b>
				</p>
			)}
		</div>
	);
};

export default AdminOverviewEvents;
