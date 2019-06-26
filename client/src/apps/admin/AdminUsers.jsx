import { Component } from 'react';
import { Link } from 'react-router-dom';

import addClass from 'classnames';
import DropDown from 'components/DropDown';
import Pager from 'components/Pager';
import Animate from 'animate.css-react';

import AdminTabs from './AdminTabs';
import { scrollTo } from 'shared/utils';
import UserForm from 'components/Users/UserForm';
import Notification from 'components/Notification';
import { pagerPerPage } from 'shared/config/defaults';
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

class AdminUsers extends Component {
	static displayName = 'Admin Users';

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
		this.users = props.store.users;
		const { id = null } = props.match.params;
		if (id) {
			this._selectedId = parseInt(id, 10);
		}

		this.state = {
			filters: {
				perPage: 20,
				page: 1,
				searchTerm: '',
				sortBy: 'lastLogin',
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
		// this.scrollToComponentTop();
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

	handleCloseNew = e => {
		e.preventDefault();
		this._selectedId = null;
		this.setState(
			{
				...this._resetActions
			},
			this.goUsersHome
		);
	};

	goUsersHome = () => this.props.history.push('/users');

	handleAfterActivate = user => {
		this.users = this.users.map(u => {
			if (u.$loki === user.$loki) return user;
			return u;
		});
	};

	handleAfterFormSubmit = user => {
		if (!user) {
			this._selectedId = null;
			this.setState(
				{
					...this._resetActions
				},
				this.goUsersHome
			);
			return;
		}
		let { isEdit, addNew, isCopy, isRemove } = this.state;

		if (isEdit) {
			this.users = this.users.map(u => {
				if (u.$loki === user.$loki) return user;
				return u;
			});
		} else if (!isRemove) {
			this.users.push(user);
			this._selectedId = user.$loki;
		}

		this.setState(
			{
				newAdded: addNew || isCopy,
				editCompleted: isEdit,
				removeCompleted: isRemove,
				...this._resetActions
			},
			() => {
				setTimeout(() => {
					this._selectedId = null;
					if (isRemove) {
						let removeIndex = this.users.findIndex(u => u.$loki === parseInt(user.removedId, 10));
						this.users.splice(removeIndex, 1);
					}
					this.setState({ newAdded: false, editCompleted: false, removeCompleted: false }, this.goUsersHome);
				}, 2000);
			}
		);
	};

	removeFilter = e => {
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

		if (sortBy === 'created' || sortBy === 'lastLogin') {
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

	applyFilters(users, filters) {
		const term = filters.searchTerm.split(':');
		const isKeyFilter = term && term.length === 2 ? true : false;
		let key = term[0].trim();

		if (key === 'id' || key === 'uid') key = '$loki';

		if (isKeyFilter && ['name', '$loki', 'userId', 'email'].includes(key) !== -1) {
			return this.users.filter(u => {
				const keyFilter = ['$loki', 'userId'].includes(key) ? (u[key] += '') : u[key] && u[key].toLowerCase();
				return (keyFilter && keyFilter.toLowerCase().includes(term[1].trim().toLowerCase())) || false;
			});
		}
		return this.users.filter(
			u =>
				u.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
				(u.email && u.email.toLowerCase().includes(filters.searchTerm.toLowerCase()))
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

	getSelected = () => {
		if (!this._selectedId) return null;
		let user = { ...this.users.find(u => u.$loki === this._selectedId) };

		if (this.state.isCopy) {
			user.name = `Copy of ${user.name}`;
		}
		return user;
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

	handleDataUpdate = user => {
		if (!user || !user.$loki) return;
		this.users = this.users.map(u => {
			if (u.$loki === user.$loki) return user;
			return u;
		});
		this.forceUpdate();
	};

	render() {
		const {
			store,
			store: { users, providers, data, email, name }
		} = this.props;
		const {
			removeFilter,
			sortByFn,
			handleSortByClick,
			handleCloseNew,
			handleAfterFormSubmit,
			handleAfterActivate,
			handlePerPageChange,
			handlePageChange,
			getSelected,
			handleDataUpdate,
			handleEditFromView
		} = this;
		const { newAdded, filters, addNew, isEdit, isCopy, isRemove, isView, editCompleted, removeCompleted } = this.state;
		const { sortBy, perPage, page } = filters;
		const usersFiltered = this.applyFilters(users, filters).sort(sortByFn);
		const isUsersFiltered = users.length !== usersFiltered.length;

		return (
			<div class="clear">
				<AdminTabs selected={'Users'} {...{ store }} />
				<nav class="level" ref={ref => (this.tabsElement = ref)}>
					<div class="level-left" style={{ visibility: addNew ? 'hidden' : '' }}>
						<div class="level-item">
							<div class="field has-addons">
								<p class="control">
									{isUsersFiltered && (
										<a href="/#" title="Remove Filter" class="removeFilter icon" onClick={removeFilter}>
											&#205;
										</a>
									)}
									<input
										className="input is-medium"
										onChange={this.inputPropertyFilter}
										type="text"
										placeholder="Filter"
										value={filters.searchTerm}
									/>
								</p>
							</div>
						</div>
						<div class="level-item">
							<p class="subtitle is-medium has-text-left fixed-100">
								<strong>{usersFiltered.length}</strong> of <strong>{users.length}</strong>
							</p>
						</div>
					</div>
					<div class="level-right">
						<p class="level-item">
							{addNew || isEdit || isCopy || isRemove || isView ? (
								<a href="/#" class="add-new button is-medium is-primary" onClick={handleCloseNew}>
									<span>
										<span className="icon">&#205;</span>
										<b>
											CLOSE {addNew && 'NEW'} {isEdit && 'EDIT'} {isCopy && 'COPY'} {isRemove && 'REMOVE'}{' '}
											{isView && 'VIEW'} FORM
										</b>
									</span>
								</a>
							) : (
								<Link to="/users/new" class="add-new button is-medium is-primary">
									<span>
										<span class="icon">&#192;</span>
										<b>ADD NEW USER</b>
									</span>
								</Link>
							)}
						</p>
					</div>
				</nav>

				{newAdded && (
					<Notification>
						<p>
							<b>Success</b> user form submited
						</p>
					</Notification>
				)}
				{editCompleted && (
					<Notification type="is-info">
						<p>
							<b>Update Success</b> user updated
						</p>
					</Notification>
				)}
				{removeCompleted && (
					<Notification type="is-danger">
						<p>
							<b>Done!</b> User Removed
						</p>
					</Notification>
				)}
				{addNew || isEdit || isCopy || isRemove || isView ? (
					<Animate appear="fadeIn">
						<UserForm
							onSubmit={handleAfterFormSubmit}
							onDataUpdate={handleDataUpdate}
							form={getSelected()}
							onActivate={handleAfterActivate}
							isAdmin={true}
							onEdit={handleEditFromView}
							{...{ email, name, data, providers, addNew, isEdit, isCopy, isRemove, isView }}
							scrollToForm={true}
						/>
					</Animate>
				) : usersFiltered.length > 0 ? (
					<div>
						<table class="table" ref={ref => (this.tableElement = ref)}>
							<thead>
								<tr>
									<th class="is-narrow">
										<Sortible onClick={handleSortByClick} sortBy={sortBy} field={'$loki'} name={'uid'} />
									</th>
									<th>
										<Sortible onClick={handleSortByClick} sortBy={sortBy} field={'name'} name={'User Name'} />
									</th>
									<th class="is-narrow">Email</th>
									<th class="is-narrow">Provider</th>
									<th>
										<Sortible onClick={handleSortByClick} sortBy={sortBy} field={'created'} name={'Created'} />
									</th>

									<th>
										<Sortible onClick={handleSortByClick} sortBy={sortBy} field={'lastLogin'} name={'Last Login'} />
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
								{usersFiltered.slice((page - 1) * perPage, perPage * page).map(user => (
									<tr
										key={user.$loki}
										className={addClass(
											{
												disabled: user.active === false,
												animated: user.$loki === this._selectedId,
												'is-removing fadeOut': removeCompleted,
												'is-edited flash': newAdded || editCompleted
											},
											'row'
										)}
									>
										<td className="is-narrow is-id">
											<Link to={`/users/${user.$loki}`}>{user.$loki}</Link>
										</td>
										<td>
											<Link to={`/users/${user.$loki}`}>{user.name}</Link>
										</td>
										<td className="is-narrow">{user.email}</td>
										<td className="is-narrow">
											{user.isProvider ? (
												<Link to={`/users/${user.$loki}`} target="_blank">
													<span className="icon pointer" title="User is Provoder">
														&#244;
													</span>
												</Link>
											) : (
												<span className="icon pointer" title="User is Provoder">
													&#197;
												</span>
											)}
										</td>
										<td>
											<span
												className="hint--timeout hint--bottom"
												aria-label={moment.utc(new Date(user.created)).format('lll')}
											>
												{timeago(user.created)}
											</span>
										</td>
										<td>
											<span
												className="hint--timeout hint--bottom"
												aria-label={moment.utc(new Date(user.lastLogin)).format('lll')}
											>
												{timeago(user.lastLogin)}
											</span>{' '}
										</td>
										<td className="actions is-narrow">
											<a href="/edit" title="edit" onClick={this.handleEdit(user.$loki)}>
												&#0063;
											</a>
											<a href="/copy" title="copy" onClick={this.handleCopy(user.$loki)}>
												&#0047;
											</a>
											<a href="/remove" class="remove-icon" title="remove" onClick={this.handleRemove(user.$loki)}>
												&#204;
											</a>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						<Pager onChange={handlePageChange} page={page} perPage={perPage} length={usersFiltered.length} />
					</div>
				) : (
					<p class="has-text-centered">
						<b>Nothing is found</b> - [
						<a href="/#" onClick={removeFilter}>
							remove filters]
						</a>
					</p>
				)}
			</div>
		);
	}
}

export default AdminUsers;
