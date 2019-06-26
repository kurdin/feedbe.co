import { Component } from 'react';
import { Link } from 'react-router-dom';

import addClass from 'classnames';
import { JSXFilters } from 'shared/filters';
import DropDown from 'components/DropDown';
import Pager from 'components/Pager';
import Animate from 'animate.css-react';

import AdminTabs from './AdminTabs';
import { scrollTo } from 'shared/utils';
import ProviderForm from 'components/Providers/ProviderForm';
import Notification from 'components/Notification';
import { pagerPerPage } from 'shared/config/defaults';
import { Tooltip } from 'shared/inferno-tippy/src/';
import 'shared/inferno-tippy/src/tippy.css';

import moment from 'moment';
import { format as timeago } from 'timeago.js';

const filter = new JSXFilters();
// const uniqueArr = (arrArg) => arrArg.filter((elem, pos, arr) => arr.indexOf(elem) === pos);

const Sortible = ({ onClick, sortBy, name, field }) => {
	return (
		<a href="/#" class="sortby" onClick={onClick(field)}>
			{name} {sortBy === field && <span class="icon">&#227;</span>}
		</a>
	);
};

class AdminProviders extends Component {
	static displayName = 'Admin Providers';

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
		this.providers = props.store.providers;
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

	handleCloseNewProvider = e => {
		e.preventDefault();
		this._selectedId = null;
		this.setState(
			{
				...this._resetActions
			},
			this.goProviderHome
		);
	};

	goProviderHome = () => this.props.history.push('/providers');

	handleAfterActivate = provider => {
		this.providers = this.providers.map(p => {
			if (p.$loki === provider.$loki) return provider;
			return p;
		});
	};

	handleAfterFormSubmit = provider => {
		if (!provider) {
			this._selectedId = null;
			this.setState(
				{
					...this._resetActions
				},
				this.goProviderHome
			);
			return;
		}
		let { isEdit, addNew, isCopy, isRemove } = this.state;

		if (isEdit) {
			this.providers = this.providers.map(p => {
				if (p.$loki === provider.$loki) return provider;
				return p;
			});
		} else if (!isRemove) {
			this.providers.push(provider);
			this._selectedId = provider.$loki;
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
						let removeIndex = this.providers.findIndex(p => p.$loki === parseInt(provider.removedId, 10));
						this.providers.splice(removeIndex, 1);
					}
					this.setState({ newAdded: false, editCompleted: false, removeCompleted: false }, this.goProviderHome);
				}, 2000);
			}
		);
	};

	removeProvidersFilter = e => {
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

	filterProviders(providers, filters) {
		const term = filters.searchTerm.split(':');
		const isKeyFilter = term && term.length === 2 ? true : false;
		let key = term[0].trim();

		if (key === 'id') key = '$loki';
		if (key === 'uid') key = 'userId';

		if (isKeyFilter && ['name', '$loki', 'userId', 'about', 'phone', 'address', 'zip', 'email'].includes(key) !== -1) {
			return this.providers.filter(p => {
				const keyFilter = ['$loki', 'userId', 'zip'].includes(key) ? (p[key] += '') : p[key] && p[key].toLowerCase();
				return (keyFilter && keyFilter.toLowerCase().includes(term[1].trim().toLowerCase())) || false;
			});
		}
		return this.providers.filter(
			p =>
				p.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
				(p.about && p.about.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
				p.address.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
				(p.zip + '').includes(filters.searchTerm) ||
				(p.email && p.email.toLowerCase().includes(filters.searchTerm.toLowerCase()))
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

	getSelectedProvider = () => {
		if (!this._selectedId) return null;
		let provider = { ...this.providers.find(p => p.$loki === this._selectedId) };

		if (this.state.isCopy) {
			provider.name = `Copy of ${provider.name}`;
		}
		return provider;
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

	handleProviderDataUpdate = provider => {
		if (!provider || !provider.$loki) return;
		this.providers = this.providers.map(p => {
			if (p.$loki === provider.$loki) return provider;
			return p;
		});
		this.forceUpdate();
	};

	render() {
		const {
			store,
			store: { providers, users, data, email, name }
		} = this.props;
		const {
			removeProvidersFilter,
			sortByFn,
			handleSortByClick,
			handleCloseNewProvider,
			handleAfterFormSubmit,
			handleAfterActivate,
			handlePerPageChange,
			handlePageChange,
			getSelectedProvider,
			handleProviderDataUpdate,
			handleEditFromView
		} = this;
		const { newAdded, filters, addNew, isEdit, isCopy, isRemove, isView, editCompleted, removeCompleted } = this.state;
		const { sortBy, perPage, page } = filters;
		const providersFiltered = this.filterProviders(providers, filters).sort(sortByFn);
		const isProvidersFiltered = providers.length !== providersFiltered.length;

		return (
			<div class="clear">
				<AdminTabs selected={'Providers'} {...{ store }} />
				<nav class="level" ref={ref => (this.tabsElement = ref)}>
					<div class="level-left" style={{ visibility: addNew ? 'hidden' : '' }}>
						<div class="level-item">
							<div class="field has-addons">
								<p class="control">
									{isProvidersFiltered && (
										<a href="/#" title="Remove Filter" class="removeFilter icon" onClick={removeProvidersFilter}>
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
								<strong>{providersFiltered.length}</strong> of <strong>{providers.length}</strong>
							</p>
						</div>
					</div>
					<div class="level-right">
						<p class="level-item">
							{addNew || isEdit || isCopy || isRemove || isView ? (
								<a href="/#" class="add-new button is-medium is-primary" onClick={handleCloseNewProvider}>
									<span>
										<span class="icon">&#205;</span>
										<b>
											CLOSE {addNew && 'NEW'} {isEdit && 'EDIT'} {isCopy && 'COPY'} {isRemove && 'REMOVE'}{' '}
											{isView && 'VIEW'} FORM
										</b>
									</span>
								</a>
							) : (
								<Link to="/providers/new" class="add-new button is-medium is-primary">
									<span>
										<span class="icon">&#192;</span>
										<b>ADD NEW PROVIDER</b>
									</span>
								</Link>
							)}
						</p>
					</div>
				</nav>

				{/*this.state.view && (
				<ViewCodeModal
					onlist={this.on.list}
					key="viewcode"
					code={this.state.view.code}
					on={this.on.modal}
					viewOnly={true}
					elements={this.elements}
					onComponentWillUnmount={this.removeKeysEvent.bind(this)}
					error={null}
				/>
			)*/}
				{newAdded && (
					<Notification>
						<p>
							<b>Success</b> providers form submited
						</p>
					</Notification>
				)}
				{editCompleted && (
					<Notification type="is-info">
						<p>
							<b>Update Success</b> provider updated
						</p>
					</Notification>
				)}
				{removeCompleted && (
					<Notification type="is-danger">
						<p>
							<b>Done!</b> Provider Removed
						</p>
					</Notification>
				)}
				{addNew || isEdit || isCopy || isRemove || isView ? (
					<Animate appear="fadeIn">
						<ProviderForm
							onSubmit={handleAfterFormSubmit}
							onProviderDataUpdate={handleProviderDataUpdate}
							form={getSelectedProvider()}
							onActivate={handleAfterActivate}
							isAdmin={true}
							onEdit={handleEditFromView}
							{...{ addNew, isEdit, isCopy, isRemove, isView }}
							scrollToForm={true}
							{...{ email, users, name, data }}
						/>
					</Animate>
				) : providersFiltered.length > 0 ? (
					<div>
						<table class="table" ref={ref => (this.tableElement = ref)}>
							<thead>
								<tr>
									<th class="is-narrow">
										<Sortible onClick={handleSortByClick} sortBy={sortBy} field={'$loki'} name={'pid'} />
									</th>
									<th>
										<Sortible onClick={handleSortByClick} sortBy={sortBy} field={'name'} name={'Provider Name'} />
									</th>
									<th class="is-narrow">
										<Sortible onClick={handleSortByClick} sortBy={sortBy} field={'zip'} name={'Zip'} />
									</th>
									<th>Address</th>
									<th>Phone</th>
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
								{providersFiltered.slice((page - 1) * perPage, perPage * page).map(provider => (
									<tr
										key={provider.$loki}
										class={addClass(
											{
												disabled: provider.active === false,
												animated: provider.$loki === this._selectedId,
												'is-removing fadeOut': removeCompleted,
												'is-edited flash': newAdded || editCompleted
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
												{timeago(provider.created)}
											</span>
										</td>
										<td class="actions is-narrow">
											<a href="/edit" title="edit" onClick={this.handleEdit(provider.$loki)}>
												&#0063;
											</a>
											<a href="/copy" title="copy" onClick={this.handleCopy(provider.$loki)}>
												&#0047;
											</a>
											<a href="/remove" class="remove-icon" title="remove" onClick={this.handleRemove(provider.$loki)}>
												&#204;
											</a>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						<Pager onChange={handlePageChange} page={page} perPage={perPage} length={providersFiltered.length} />
					</div>
				) : (
					<p class="has-text-centered">
						<b>Nothing is found</b> - [
						<a href="/#" onClick={removeProvidersFilter}>
							remove filters]
						</a>
					</p>
				)}
			</div>
		);
	}
}

export default AdminProviders;
