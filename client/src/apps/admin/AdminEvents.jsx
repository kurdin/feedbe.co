import addClass from 'classnames';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import DropDown from 'components/DropDown';
import Pager from 'components/Pager';
import Animate from 'animate.css-react';

import AdminTabs from './AdminTabs';
import { scrollTo } from 'shared/utils';
import EventForm from 'components/Events/EventForm';
import Notification from 'components/Notification';
import { pagerPerPage } from 'shared/config/defaults';
import { Tooltip } from 'shared/inferno-tippy/src/';
import 'shared/inferno-tippy/src/tippy.css';

import moment from 'moment';
import { format as timeago } from 'timeago.js';

const Sortible = ({ onClick, sortBy, name, field }) => {
	return (
		<a href="/#" class="sortby" onClick={onClick(field)}>
			{name} {sortBy === field && <span class="icon">&#227;</span>}
		</a>
	);
};

class AdminEvents extends Component {
	static displayName = 'Admin Events';

	_selectedId = null;
	_resetActions = {
		isEdit: false,
		isCopy: false,
		isView: false,
		isRemove: false,
		addNew: false
	};

	constructor(props) {
		super(props);
		this.events = props.store.events;
		const { id = null } = props.match.params;
		if (id) {
			this._selectedId = parseInt(id, 10);
		}

		this.state = {
			filters: {
				perPage: 20,
				page: 1,
				searchTerm: '',
				sortBy: 'created',
				sortOrder: 'asc'
			},
			...this._resetActions,
			...(this._selectedId && { isView: true }),
			...(props.isNew && { addNew: true })
		};
	}

	componentDidMount() {
		this.scrollToComponentTop();
	}

	componentDidUpdate() {
		this.scrollToComponentTop();
	}

	scrollToComponentTop() {
		const { isView, isEdit, addNew } = this.state;
		if (!isEdit && !isView && !addNew) scrollTo('main', 200);
	}

	componentWillReceiveProps(nextProps) {
		const { id = null } = nextProps.match.params;
		const { isNew = null } = nextProps;

		if (isNew) {
			return this.setState({
				addNew: true
			});
		}

		if (!id) {
			return this.setState({
				isView: false
			});
		}

		if (id !== this._selectedId) {
			this._selectedId = parseInt(id, 10);
			return this.setState({
				isView: true
			});
		}
	}

	handleCloseNewEvent = e => {
		e.preventDefault();
		this._selectedId = null;
		this.setState(
			{
				...this._resetActions
			},
			this.goEventsHome
		);
	};

	goEventsHome = () => this.props.history.push('/events');

	handleAfterActivate = event => {
		this.events = this.events.map(p => {
			if (p.$loki === event.$loki) {
				return event;
			}
			return p;
		});
	};

	handleAfterFormSubmit = event => {
		if (!event) {
			this._selectedId = null;
			this.setState(
				{
					...this._resetActions
				},
				this.goEventsHome
			);
			return;
		}
		let { isEdit, addNew, isCopy, isRemove } = this.state;

		if (isEdit) {
			this.events = this.events.map(p => {
				if (p.$loki === event.$loki) {
					return event;
				}
				return p;
			});
		} else if (!isRemove) {
			this.events.push(event);
			this._selectedId = event.$loki;
		}

		this.setState(
			{
				newAdded: addNew || isCopy,
				editCompleted: isEdit,
				removeCompleted: isRemove,
				...this._resetActions
			},
			() => {
				this._selectedId = null;
				setTimeout(() => {
					if (isRemove) {
						let removeIndex = this.events.findIndex(p => p.$loki === parseInt(event.removedId, 10));
						this.events.splice(removeIndex, 1);
					}
					this.setState({ newAdded: false, editCompleted: false, removeCompleted: false }, this.goEventsHome);
				}, 2000);
			}
		);
	};

	removeEventsFilter = e => {
		e.preventDefault();
		this.setState({
			filters: {
				...this.state.filters,
				page: 1,
				searchTerm: ''
			}
		});
	};

	inputPropertyFilter = e => {
		this.setState({
			filters: {
				...this.state.filters,
				page: 1,
				searchTerm: e.target.value
			}
		});
	};

	handleViewEvent = id => e => {
		e.preventDefault();
		const selectedEvent = this.events.find(events => events.id === id);
		this.setState({ selectedEvent });
	};

	handleSortByClick = field => e => {
		e.preventDefault();
		const filters = this.state.filters;
		if (filters.sortBy === field) {
			filters.sortOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
		} else filters.sortOrder = 'asc';
		this.setState({
			filters: {
				...this.state.filters,
				page: 1,
				sortBy: field
			}
		});
	};

	sortByFn = (a, b) => {
		let {
			filters: { sortBy, sortOrder }
		} = this.state;

		if (sortBy === 'created') {
			const da = new Date(a[sortBy]);
			const db = new Date(b[sortBy]);
			if (da < db) return sortOrder === 'desc' ? -1 : 1;
			if (db <= da) return sortOrder === 'desc' ? 1 : -1;
		}

		if (sortBy.search(/zip|\$loki/) !== -1) {
			if (a[sortBy] < b[sortBy]) return sortOrder === 'desc' ? -1 : 1;
			if (b[sortBy] <= a[sortBy]) return sortOrder === 'desc' ? 1 : -1;
		}

		if (sortBy.search(/name/) !== -1) {
			if (a[sortBy].toLowerCase() < b[sortBy].toLowerCase()) return sortOrder === 'desc' ? -1 : 1;
			if (b[sortBy].toLowerCase() <= a[sortBy].toLowerCase()) return sortOrder === 'desc' ? 1 : -1;
		}
	};

	filterEvents(events, filters) {
		const term = filters.searchTerm.split(':');
		const isKeyFilter = term && term.length === 2 ? true : false;
		let key = term[0].trim();

		if (key === 'id') key = '$loki';
		if (key === 'pid') key = 'providerId';
		if (key === 'pname') key = 'providerName';

		if (isKeyFilter && ['name', '$loki', 'zip', 'providerName', 'providerId', 'description'].includes(key) !== -1) {
			return this.events.filter(p => {
				let keyFilter;
				if (key === '$loki') keyFilter = p[key] + '';
				else if (key === 'providerName') keyFilter = p.provider && p.provider.name;
				else if (key === 'providerId') keyFilter = p.provider && p.provider.id + '';
				else keyFilter = p[key] + '';

				return (keyFilter && keyFilter.toLowerCase().includes(term[1].trim().toLowerCase())) || false;
			});
		}
		return this.events.filter(
			p =>
				p.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
				p.location.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
				(p.zip + '').includes(filters.searchTerm) ||
				(p.phone && p.phone.includes(filters.searchTerm)) ||
				(p.description && p.description.toLowerCase().includes(filters.searchTerm.toLowerCase()))
		);
	}

	handlePageChange = page => {
		let filters = this.state.filters;
		if (filters.page !== page) {
			this.setState(
				{
					filters: {
						...this.state.filters,
						page
					}
				},
				() => {
					scrollTo(this.tabsElement, 300, -20);
				}
			);
		}
	};
	handlePerPageChange = val => {
		let filters = this.state.filters;
		if (val !== filters.perPage) {
			if (val === 'All') val = Number.MAX_SAFE_INTEGER;
			this.setState({
				filters: {
					...this.state.filters,
					page: 1,
					perPage: val
				}
			});
		}
	};

	getSelectedEvent = () => {
		if (!this._selectedId) return null;
		let event = { ...this.events.find(p => p.$loki === this._selectedId) };

		if (this.state.isCopy) {
			event.name = `Copy of ${event.name}`;
		}
		return event;
	};

	handleEditFromView = () => {
		this.setState({
			...this._resetActions,
			isEdit: true
		});
	};

	handleEdit = id => e => {
		e.preventDefault();
		this._selectedId = id;
		this.setState({
			isEdit: true
		});
	};

	handleCopy = id => e => {
		e.preventDefault();
		this._selectedId = id;
		this.setState({
			isCopy: true
		});
	};

	handleView = id => e => {
		e.preventDefault();
		this._selectedId = id;
		this.setState({
			isView: true
		});
	};

	handleRemove = id => e => {
		e.preventDefault();
		this._selectedId = id;
		this.setState({
			isRemove: true
		});
	};

	handleEventDataUpdate = event => {
		if (!event || !event.$loki) return;
		this.events = this.events.map(e => {
			if (e.$loki === event.$loki) return event;
			return e;
		});
		this.forceUpdate();
	};

	render() {
		const {
			store,
			store: { events, providers, data, email, name }
		} = this.props;
		const {
			removeEventsFilter,
			sortByFn,
			handleSortByClick,
			handleCloseNewEvent,
			handleAfterActivate,
			handleAfterFormSubmit,
			handlePerPageChange,
			handlePageChange,
			getSelectedEvent,
			handleEventDataUpdate,
			handleEditFromView
		} = this;
		const { newAdded, filters, addNew, isEdit, isCopy, isRemove, isView, editCompleted, removeCompleted } = this.state;
		const { sortBy, perPage, page } = filters;
		const eventsFiltered = this.filterEvents(events, filters).sort(sortByFn);
		const isEventsFiltered = events.length !== eventsFiltered.length;

		return (
			<div class="clear">
				<AdminTabs selected={'Events'} {...{ store }} />
				<nav class="level" ref={ref => (this.tabsElement = ref)}>
					<div
						class="level-left"
						style={{ visibility: addNew || isView || isCopy || isEdit || isRemove ? 'hidden' : '' }}
					>
						<div class="level-item">
							<div class="field has-addons">
								<p class="control">
									{isEventsFiltered && (
										<a href="/#" title="Remove Filter" class="removeFilter icon" onClick={removeEventsFilter}>
											&#205;
										</a>
									)}
									<input
										class="input is-medium"
										onInput={this.inputPropertyFilter}
										type="text"
										placeholder="Filter"
										value={filters.searchTerm}
									/>
								</p>
							</div>
						</div>
						<div class="level-item">
							<p class="subtitle is-medium has-text-left fixed-100">
								<strong>{eventsFiltered.length}</strong> of <strong>{events.length}</strong>
							</p>
						</div>
					</div>
					<div class="level-right">
						<p class="level-item">
							{addNew || isEdit || isCopy || isRemove || isView ? (
								<a href="/#" class="add-new button is-medium is-primary" onClick={handleCloseNewEvent}>
									<span>
										<span class="icon">&#205;</span>
										<b>
											CLOSE {addNew && 'NEW'} {isEdit && 'EDIT'} {isCopy && 'COPY'} {isRemove && 'REMOVE'}{' '}
											{isView && 'VIEW'} FORM
										</b>
									</span>
								</a>
							) : (
								<Link to="/events/new" class="add-new button is-medium is-primary">
									<span>
										<span class="icon">&#192;</span>
										<b>ADD NEW EVENT</b>
									</span>
								</Link>
							)}
						</p>
					</div>
				</nav>

				{newAdded && (
					<Notification>
						<p>
							<b>Success</b> Event form submited
						</p>
					</Notification>
				)}
				{editCompleted && (
					<Notification type="is-info">
						<p>
							<b>Update Success</b> Event updated
						</p>
					</Notification>
				)}
				{removeCompleted && (
					<Notification type="is-danger">
						<p>
							<b>Done!</b> Event Removed
						</p>
					</Notification>
				)}
				{addNew || isEdit || isCopy || isRemove || isView ? (
					<Animate appear="fadeIn">
						<EventForm
							onSubmit={handleAfterFormSubmit}
							onActivate={handleAfterActivate}
							form={getSelectedEvent()}
							onEventDataUpdate={handleEventDataUpdate}
							isAdmin={true}
							onEdit={handleEditFromView}
							scrollToForm={true}
							{...{ email, name, data, providers, addNew, isEdit, isCopy, isRemove, isView }}
						/>
					</Animate>
				) : eventsFiltered.length > 0 ? (
					<div>
						<table class="table" ref={ref => (this.tableElement = ref)}>
							<thead>
								<tr>
									<th class="is-narrow">
										<Sortible onClick={handleSortByClick} sortBy={sortBy} field={'$loki'} name={'eid'} />
									</th>
									<th>
										<Sortible onClick={handleSortByClick} sortBy={sortBy} field={'name'} name={'Event Name'} />
									</th>
									<th>Provider</th>
									<th class="is-narrow">
										<Sortible onClick={handleSortByClick} sortBy={sortBy} field={'zip'} name={'Zip'} />
									</th>

									<th>
										<span class="hint--timeout hint--top" aria-label={'Dates'}>
											<Sortible onClick={handleSortByClick} sortBy={sortBy} field={'dates'} name={'Next Date'} />
										</span>
									</th>

									<th class="is-narrow">
										<span class="is-narrow hint--timeout hint--top" aria-label={'User Id'}>
											<Sortible onClick={handleSortByClick} sortBy={sortBy} field={'userId'} name={'uid'} />
										</span>
									</th>
									<th>
										<Sortible onClick={handleSortByClick} sortBy={sortBy} field={'created'} name={'Created'} />
									</th>
									<th class="is-narrow has-text-right">
										<DropDown
											activeTitle={true}
											is-small={true}
											items={pagerPerPage}
											activeName={perPage}
											onChange={handlePerPageChange}
										/>
									</th>
								</tr>
							</thead>
							<tbody>
								{eventsFiltered.slice((page - 1) * perPage, perPage * page).map(event => (
									<tr
										key={event.$loki}
										class={addClass(
											{
												disabled: event.active === false,
												animated: event.$loki === this._selectedId,
												'is-removing fadeOut': removeCompleted,
												'is-edited flash': newAdded || editCompleted
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
												{timeago(event.created)}
											</span>
										</td>
										<td class="actions is-narrow">
											<a href="/edit" title="edit" onClick={this.handleEdit(event.$loki)}>
												&#0063;
											</a>
											<a href="/copy" title="copy" onClick={this.handleCopy(event.$loki)}>
												&#0047;
											</a>
											<a href="/remove" class="remove-icon" title="remove" onClick={this.handleRemove(event.$loki)}>
												&#204;
											</a>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						<Pager onChange={handlePageChange} page={page} perPage={perPage} length={eventsFiltered.length} />
					</div>
				) : (
					<p class="has-text-centered">
						<b>Nothing is found</b> - [
						<a href="/#" onClick={removeEventsFilter}>
							remove filters]
						</a>
					</p>
				)}
			</div>
		);
	}
}

export default AdminEvents;
